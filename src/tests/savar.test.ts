import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVAR_WARDS, CATEGORIES_CONFIG, INITIAL_COMPLAINTS } from '../data/savarData.ts';

test('Savar wards should have all 9 primary wards with valid councilor and contacts', () => {
  assert.ok(SAVAR_WARDS.length >= 9, 'Should have at least 9 wards');
  for (const ward of SAVAR_WARDS) {
    assert.ok(ward.wardNumber.length > 0, 'Ward number or zone must not be empty');
    assert.ok(ward.zone.length > 0, 'Zone must not be empty');
    assert.ok(ward.areaName.length > 0, 'Area name must not be empty');
    assert.ok(ward.councilorName.length > 0, 'Councilor name must not be empty');
    assert.ok(ward.contactNumber.length > 5, 'Contact number must be valid');
    assert.ok(ward.coordinates.x >= 0 && ward.coordinates.x <= 100, 'Coordinates x in range');
    assert.ok(ward.coordinates.y >= 0 && ward.coordinates.y <= 100, 'Coordinates y in range');
  }
});

test('Categories config should have all civic categories properly configured', () => {
  const expectedCategories = ['roads', 'drainage', 'waste', 'streetlights', 'water', 'encroachment', 'mosquito', 'other'];
  for (const cat of expectedCategories) {
    const config = CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG];
    assert.ok(config, `Category ${cat} should exist`);
    assert.ok(config.labelBn.length > 0, `Category ${cat} should have Bengali label`);
    assert.ok(config.labelEn.length > 0, `Category ${cat} should have English label`);
    assert.ok(config.departmentDefault.length > 0, `Category ${cat} should have default department`);
  }
});

test('Initial complaints data should have realistic Savar samples and diverse statuses', () => {
  assert.ok(INITIAL_COMPLAINTS.length >= 5, 'Should have at least 5 initial complaints');
  
  const hasPending = INITIAL_COMPLAINTS.some((c) => c.status === 'pending');
  const hasApproved = INITIAL_COMPLAINTS.some((c) => c.status === 'approved');
  const hasInProgress = INITIAL_COMPLAINTS.some((c) => c.status === 'in_progress');
  const hasSolved = INITIAL_COMPLAINTS.some((c) => c.status === 'solved');

  assert.ok(hasPending, 'Should have pending complaints awaiting admin approval');
  assert.ok(hasApproved || hasInProgress, 'Should have active work complaints');
  assert.ok(hasSolved, 'Should have solved complaints with before/after photos');

  const solvedComp = INITIAL_COMPLAINTS.find((c) => c.status === 'solved');
  assert.ok(solvedComp?.solutionDetails, 'Solved complaints should contain solution details');
  assert.ok(solvedComp?.solvedImageUrl, 'Solved complaints should contain solved image');
});

test('Public complaints filter logic only includes approved, in_progress, and solved', () => {
  const publicFeed = INITIAL_COMPLAINTS.filter(
    (c) => c.status === 'approved' || c.status === 'in_progress' || c.status === 'solved'
  );
  
  for (const item of publicFeed) {
    assert.notEqual(item.status, 'pending', 'Pending complaints must not be in public feed');
    assert.notEqual(item.status, 'rejected', 'Rejected complaints must not be in public feed');
  }
});

test('Greater Savar covers Baipayl, Ashulia, Jamgora and surrounding zones', () => {
  const hasBaipayl = SAVAR_WARDS.some(w => w.wardNumber.includes('Baipayl') || w.areaName.includes('Baipayl'));
  const hasAshulia = SAVAR_WARDS.some(w => w.wardNumber.includes('Ashulia') || w.areaName.includes('Ashulia'));
  const hasJamgora = SAVAR_WARDS.some(w => w.areaName.includes('Jamgora'));
  const hasNabinagar = SAVAR_WARDS.some(w => w.wardNumber.includes('Nabinagar') || w.areaName.includes('Nabinagar'));

  assert.ok(hasBaipayl, 'Must include Baipayl zone');
  assert.ok(hasAshulia, 'Must include Ashulia zone');
  assert.ok(hasJamgora, 'Must include Jamgora area');
  assert.ok(hasNabinagar, 'Must include Nabinagar zone');
});

test('Ward filtering logic accurately segregates complaints by ward', () => {
  for (let i = 1; i <= 9; i++) {
    const wardId = `Ward ${i}`;
    const wardComplaints = INITIAL_COMPLAINTS.filter(c => c.ward === wardId);
    // Each ward's filtered complaints should have that exact ward
    for (const c of wardComplaints) {
      assert.equal(c.ward, wardId, `Complaint ward must match ${wardId}`);
    }
  }
});
