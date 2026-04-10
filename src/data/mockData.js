export const resourcesSeed = [
  { id: 1, name: 'Lecture Hall Alpha 250', type: 'Gravity', location: 'Building 4, Floor 2', capacity: 250, status: 'ACTIVE', features: ['Fiber Optic', 'Surround Sound'] },
  { id: 2, name: 'Bio-Chem Lab 12', type: 'Stations', location: 'Science Wing, Room 42', capacity: 32, status: 'OUT_OF_SERVICE', features: ['Class 100 Clean', 'Ventilated'] },
  { id: 3, name: 'Laser Projection XL-9', type: 'Unit', location: 'Central Storage B', capacity: 1, status: 'ACTIVE', features: ['4K Native', 'Battery Pack'] },
  { id: 4, name: 'Innovation Suite', type: 'Capacity', location: 'Design Wing, F1', capacity: 12, status: 'ACTIVE', features: ['Smart Board', 'Lounge Access'] },
]

export const bookingRows = [
  { id: 1, requester: 'Sarah Chen', role: 'Engineering Lead', resource: 'Quantum-X Server Rack', schedule: 'Oct 24, 2024 09:00 AM - 05:00 PM', status: 'PENDING', note: '' },
  { id: 2, requester: 'Marcus Thorne', role: 'Senior Architect', resource: 'Conference Suite Alpha', schedule: 'Oct 25, 2024 10:00 AM - 12:00 PM', status: 'APPROVED', note: 'Confirmed for stakeholder quarterly.' },
  { id: 3, requester: 'Elena Rodriguez', role: 'Operations Specialist', resource: 'Fleet Vehicle #82', schedule: 'Oct 26, 2024 Multi-day booking', status: 'PENDING', note: '' },
  { id: 4, requester: 'David Kim', role: 'Lead Designer', resource: 'Render Farm Cluster B', schedule: 'Oct 24, 2024 ASAP Priority', status: 'REJECTED', note: 'Scheduled maintenance during this window.' },
]

export const incidentsSeed = [
  { id: 1, title: 'HVAC Fault: West Wing Server Room', desc: 'Temperature spike detected in Sector 4. Immediate on-site inspection required.', priority: 'HIGH', status: 'OPEN', category: 'Mechanical', time: '2 hours ago' },
  { id: 2, title: 'Structural Integrity: Parking Ramp B', desc: 'Hairline cracks identified in supporting pillar P-12. Engineering assessment needed.', priority: 'MEDIUM', status: 'IN PROGRESS', category: 'Infrastructure', time: 'Yesterday' },
  { id: 3, title: 'Backup Generator: Annual Load Test', desc: 'Generator 2 failed to reach peak output during monthly test cycle.', priority: 'HIGH', status: 'OPEN', category: 'Mechanical', time: '5 hours ago' },
  { id: 4, title: 'Lighting Upgrade: Main Lobby', desc: 'Scheduled replacement of standard bulbs with energy-efficient LEDs.', priority: 'LOW', status: 'RESOLVED', category: 'Electrical', time: '3 days ago' },
]
