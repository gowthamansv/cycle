import { Injectable, signal, computed } from '@angular/core';
import {
  ServiceCatalogItem,
  ServiceDepartment,
  DigitalBicyclePassport,
  BicycleType,
  DigitalHealthStatus
} from '../models/cycle-management.models';

@Injectable({
  providedIn: 'root'
})
export class FreewheelCatalogService {
  // 8 High-Level Workshop Departments
  readonly departments: { name: ServiceDepartment; icon: string; tagline: string; count: number }[] = [
    { name: 'Bike Service', icon: 'pi pi-wrench', tagline: 'Multi-tier overhaul & standard maintenance', count: 2 },
    { name: 'Performance & Race', icon: 'pi pi-flag-fill', tagline: 'Race calibration & aerodynamic setup', count: 2 },
    { name: 'Bike Fit & Ergonomics', icon: 'pi pi-compass', tagline: '3D motion capture & biometric cleat fitting', count: 2 },
    { name: 'Suspension Lab', icon: 'pi pi-sliders-v', tagline: 'Lower leg, damper rebuilds & shock tuning', count: 1 },
    { name: 'Wheels & Tyres', icon: 'pi pi-sync', tagline: 'Wheel building, tensiometer trueing & tubeless', count: 2 },
    { name: 'Components & Drivetrain', icon: 'pi pi-cog', tagline: 'Ultrasonic cleaning, electronic Di2/AXS & brakes', count: 4 },
    { name: 'Mobile & Event Support', icon: 'pi pi-truck', tagline: 'Doorstep mobile van & roadside rescue', count: 1 },
    { name: 'Inspection & Digital', icon: 'pi pi-verified', tagline: 'Digital Bicycle Passport & pre-owned audits', count: 6 }
  ];

  // 20 Standardized Master Services
  private servicesSignal = signal<ServiceCatalogItem[]>([
    {
      id: 'FWF-01',
      categoryNumber: 1,
      code: 'GEN-SVC',
      name: 'General Bicycle Service',
      department: 'Bike Service',
      tagline: 'Essential tune-up for everyday & regular commuter bicycles',
      description: 'Complete inspection, torque calibration, brake & gear tuning, drivetrain cleaning and safety check.',
      icon: 'pi pi-wrench',
      basePrice: 850,
      estimatedMinutes: 60,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Hybrid', 'BMX', 'Gravel', 'Other'],
      sopChecklist: [
        'Complete bicycle frame and fork visual inspection',
        'Fastener torque verification to manufacturer specs',
        'Front & rear brake caliper adjustment and pad alignment',
        'Front & rear derailleur indexing and cable tension tuning',
        'Chain cleaning, degreasing and precision wet/dry lube application',
        'Drivetrain surface wipe & debris removal',
        'Wheel lateral alignment check',
        'Tyre pressure check & inflation to rider spec',
        'Headset, bottom bracket, and hub bearing play inspection',
        'Safety verification and technician test ride'
      ],
      includedBenefits: [
        '10-Point Safety Pass',
        'Precision Gear Indexing',
        'Digital Service Timestamp'
      ]
    },
    {
      id: 'FWF-02',
      categoryNumber: 2,
      code: 'PREM-SVC',
      name: 'Premium / Complete Service',
      department: 'Bike Service',
      tagline: 'Deep overhaul with ultrasonic drivetrain spa & full truing',
      description: 'Full drivetrain removal, ultrasonic parts immersion, precision wheel truing, bearing inspection, and digital report.',
      icon: 'pi pi-sparkles',
      basePrice: 2200,
      estimatedMinutes: 150,
      isSignature: true,
      signatureBadge: 'TOP REVENUE PACKAGE',
      compatibleBikeTypes: ['Road', 'Mountain', 'Hybrid', 'Gravel', 'Electric'],
      sopChecklist: [
        'Full General Service procedures included',
        'Complete drivetrain disassembly (crankset, chain, cassette, derailleurs)',
        'Deep ultrasonic bath cleaning of all compatible components',
        'Cassette tooth profile and chain wear elongation measurement',
        'Derailleur pivot lubrication and jockey wheel service',
        'Brake system caliper piston reset and rotor degreasing',
        'Inner cables & outer housing friction evaluation',
        'Wheel precision truing in truing stand with spoke tension check',
        'Hub, headset, and bottom bracket bearing smoothness audit',
        'Frame and fork hand-polish & protective shine',
        'Full professional technician test ride',
        'Digital Bicycle Passport update & service report generation'
      ],
      includedBenefits: [
        'Ultrasonic Drivetrain Spa Included',
        'Precision Wheel Truing',
        'Digital Passport Update'
      ]
    },
    {
      id: 'FWF-03',
      categoryNumber: 3,
      code: 'RACE-SVC',
      name: 'Performance / Race Service',
      department: 'Performance & Race',
      tagline: 'Optimized efficiency for XC, Road, Gravel & Racing bicycles',
      description: 'Frictional loss reduction, suspension sag & damping setup, cockpit tuning, and pre-race certification.',
      icon: 'pi pi-bolt',
      basePrice: 3200,
      estimatedMinutes: 180,
      isSignature: true,
      signatureBadge: 'FREEWHEEL FACTORY RACE READY',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel'],
      sopChecklist: [
        'Complete high-stress race chassis inspection',
        'Drivetrain frictional efficiency check & race wax application',
        'Brake bite-point and thermal modulation test',
        'Wheel deflection and dynamic tensiometer spoke balancing',
        'Suspension sag, high/low-speed compression & rebound tuning',
        'Terrain-specific tyre pressure calibration (dry/wet casings)',
        'Cockpit ergonomics (reach, hood angle, lever position)',
        'Shoe cleat position & pedal engagement check',
        'Race-specific component torque verification',
        'High-intensity pre-race safety test ride',
        'Digital Race-Ready Certificate issued'
      ],
      includedBenefits: [
        'Official Race-Ready Pass',
        'Race Wax Drivetrain Prep',
        'Dynamic Suspension Sag Setup'
      ]
    },
    {
      id: 'FWF-04',
      categoryNumber: 4,
      code: 'SUSP-LAB',
      name: 'Suspension Lab & Rebuild',
      department: 'Suspension Lab',
      tagline: '50h Lower-leg, 200h damper teardown, air-can & rear shock service',
      description: 'Dedicated suspension overhaul with SKF wiper seals, bath oil replacement, damper vacuum bleeding, and sag setup.',
      icon: 'pi pi-sliders-v',
      basePrice: 2800,
      estimatedMinutes: 120,
      isSignature: true,
      signatureBadge: 'SUSPENSION LAB',
      compatibleBikeTypes: ['Mountain', 'Electric'],
      sopChecklist: [
        'Stanchion scratch audit and bushing play diagnosis',
        'Lower-leg removal, bath oil draining, and internal decontamination',
        'Foam ring cleaning, saturation & SKF wiper seal replacement',
        'Air spring teardown, dynamic O-ring replacement & Slick Honey lube',
        'Damper cartridge inspection, oil replacement & vacuum bleed',
        'Rear shock air-can seal kit refresh and IFP nitrogen/air charge',
        'Calibrated reassembly with exact manufacturer oil volumes',
        'Sag, rebound and high/low-speed compression setup for rider weight'
      ],
      includedBenefits: [
        'SKF Wiper Seal Upgrades',
        'Damper Bleed Guarantee',
        'Custom Rider Weight Setup'
      ]
    },
    {
      id: 'FWF-05',
      categoryNumber: 5,
      code: 'DRIVE-SVC',
      name: 'Drivetrain & Electronic Shifting Service',
      department: 'Components & Drivetrain',
      tagline: 'Ultrasonic immersion, chain wear check, Di2/AXS calibration',
      description: 'Ultrasonic hot-melt chain waxing, cassette refresh, derailleur hanger alignment, and wireless shifting diagnostics.',
      icon: 'pi pi-cog',
      basePrice: 1400,
      estimatedMinutes: 75,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric'],
      sopChecklist: [
        'Chain wear digital micrometer measurement (0.5% / 0.75% thresholds)',
        'Cassette removal, ultrasonic degrease bath & inspection',
        'Chainring tooth profiling and spider bolt torque verification',
        'Crankset removal, spindle clean & bottom bracket bearing check',
        'Derailleur hanger precision alignment with digital alignment gauge',
        'Shimano Di2 / SRAM AXS electronic diagnosis and micro-trim calibration',
        'Hot-melt chain waxing or premium friction-reducing lube application'
      ],
      includedBenefits: [
        'Hot-Melt Wax Option',
        'Laser Hanger Alignment',
        'Di2/AXS Firmware Diagnostics'
      ]
    },
    {
      id: 'FWF-06',
      categoryNumber: 6,
      code: 'BRAKE-SVC',
      name: 'Hydraulic & Mechanical Brake Service',
      department: 'Components & Drivetrain',
      tagline: 'DOT/Mineral oil bleeding, piston balancing & rotor trueing',
      description: 'Full hydraulic bleed, caliper piston deep cleaning, pad glaze removal, and precision rotor truing.',
      icon: 'pi pi-shield',
      basePrice: 1100,
      estimatedMinutes: 60,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX'],
      sopChecklist: [
        'Pad thickness measurement (minimum 0.5mm backing rule)',
        'Rotor thickness micrometer check (min 1.5mm standard)',
        'Caliper piston deep clean, seal lube & equalized advancement',
        'Hydraulic line leak check and compression olive/barb inspection',
        'Complete system hydraulic bleed with fresh Mineral/DOT fluid',
        'Rotor trueing with rotor truing fork and alcohol decontamination',
        'High-load thermal fade & bite-point lever test'
      ],
      includedBenefits: [
        'Piston Seal Lubrication',
        'Fresh Hydraulic Fluid',
        'Guaranteed Bite-Point'
      ]
    },
    {
      id: 'FWF-07',
      categoryNumber: 7,
      code: 'WHEEL-LAB',
      name: 'Wheel Lab & Custom Wheel Building',
      department: 'Wheels & Tyres',
      tagline: 'Hand-built custom wheelsets, tensiometer balancing & freehub service',
      description: 'Master wheel building based on rider weight, rim ERD, hub geometry, uniform tension balancing, and hub overhauls.',
      icon: 'pi pi-sync',
      basePrice: 1900,
      estimatedMinutes: 120,
      isSignature: true,
      signatureBadge: 'WHEEL LAB',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'BMX'],
      sopChecklist: [
        'Spoke length calculation & 2x/3x lacing geometry setup',
        'Spoke tension balance with digital tensiometer',
        'Radial runout, lateral truing & dish centering to <0.2mm tolerance',
        'Multi-stage spoke stress relieving',
        'Hub loose-ball repack / sealed cartridge bearing replacement',
        'Freehub pawl & ratchet ring inspection and light lube refresh',
        'Wheel build certificate with individual spoke tension chart'
      ],
      includedBenefits: [
        'Sub-0.2mm Trueing Tolerance',
        'Spoke Tension Graph',
        'Lifetime Trueing Warranty'
      ]
    },
    {
      id: 'FWF-08',
      categoryNumber: 8,
      code: 'TYRE-TUBE',
      name: 'Tyre & Tubeless Service Lab',
      department: 'Wheels & Tyres',
      tagline: 'Tubeless conversion, rim tape renewal & XC pressure optimization',
      description: 'Tubeless conversions, sealant recharge, rim-tape sealing, puncture repair, and casing optimization.',
      icon: 'pi pi-circle',
      basePrice: 650,
      estimatedMinutes: 45,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Electric', 'Hybrid'],
      sopChecklist: [
        'Tyre casing inspection for cuts, delamination & bead integrity',
        'Rim tape removal, bead-seat cleaning & high-pressure tape taping',
        'Tubeless valve installation with O-ring seal check',
        'Tyre bead seating with high-flow blast inflator',
        'Synthetic tubeless sealant injection (60-120ml as per tyre width)',
        'Dunk-tank bubble leak diagnostic test',
        'XC/Road terrain-specific tyre pressure calibration'
      ],
      includedBenefits: [
        'Dunk-Tank Leak Certified',
        'Premium MilKit/Orange Sealant',
        'Terrain Pressure Calibration'
      ]
    },
    {
      id: 'FWF-09',
      categoryNumber: 9,
      code: 'FIT-3D',
      name: 'Professional 3D Bike Fitting',
      department: 'Bike Fit & Ergonomics',
      tagline: 'High-value biomechanical 3D motion capture & joint angle optimization',
      description: '4-stage dynamic fit: biomechanical interview, 3D motion capture, millimeter adjustments, and Digital Bike Fit report.',
      icon: 'pi pi-compass',
      basePrice: 4500,
      estimatedMinutes: 150,
      isSignature: true,
      signatureBadge: '3D BIKE FIT LAB',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Other'],
      sopChecklist: [
        'Stage 1: Biomechanical rider assessment (flexibility, inseam, pelvic tilt)',
        'Stage 2: 3D infrared dynamic motion capture tracking knee/hip/ankle angles',
        'Stage 3: Saddle height, setback & tilt adjustments (target 35-40 deg knee extension)',
        'Stage 4: Cockpit reach, stem angle, handlebar rotation, hood alignment',
        'Stage 5: Cleat angle, rotation & footbed arch support integration',
        'Stage 6: Before & after dynamic motion comparison',
        'Customer Digital Bike Fit Report with 3D coordinate chart'
      ],
      includedBenefits: [
        'Full 3D Motion Report',
        'Free 30-Day Follow-Up',
        'Zero-Numbness Guarantee'
      ]
    },
    {
      id: 'FWF-10',
      categoryNumber: 10,
      code: 'CLEAT-FIT',
      name: 'Dedicated Cleat & Footbed Fitting',
      department: 'Bike Fit & Ergonomics',
      tagline: 'Fore/aft, lateral stance width (Q-factor), and rotational alignment',
      description: 'Foot arch profiling, metatarsal axis alignment, Q-factor adjustment, and tibial rotation compensation.',
      icon: 'pi pi-arrow-right-arrow-left',
      basePrice: 1200,
      estimatedMinutes: 45,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel'],
      sopChecklist: [
        'Foot arch measurement & insole support evaluation',
        '1st and 5th metatarsal head axis marking on shoe sole',
        'Cleat fore/aft positioning directly over pedal spindle axis',
        'Lateral stance width (Q-Factor) adjustment for hip alignment',
        'Rotational float angle setup matching natural foot flare',
        'Left vs right leg discrepancy / wedge shim evaluation',
        'Final calibrated torque check on cleat mounting bolts'
      ],
      includedBenefits: [
        'Knee Strain Prevention',
        'Power Transfer Boost',
        'Torque-Secured Bolts'
      ]
    },
    {
      id: 'FWF-11',
      categoryNumber: 11,
      code: 'BEAR-SVC',
      name: 'Bearing Overhaul & Press-Fit Service',
      department: 'Components & Drivetrain',
      tagline: 'Headset, bottom bracket, hub & full-suspension linkage pivots',
      description: 'Precision bearing removal, ultrasonic cleaning, Enduro MAX bearing press-fit installation, and zero-play preload.',
      icon: 'pi pi-table',
      basePrice: 1600,
      estimatedMinutes: 90,
      isSignature: false,
      compatibleBikeTypes: ['Mountain', 'Road', 'Gravel', 'Electric'],
      sopChecklist: [
        'Headset upper/lower cartridge bearing inspection & repacking',
        'Bottom bracket shell facing, chasing & press-fit/threaded installation',
        'Full-suspension linkage pivot disassembly & bearing rotation check',
        'Blind-hole bearing extraction with expansion collets',
        'Press-in installation of Enduro MAX full-complement bearings',
        'Pivot bolt threadlock application & torque verification'
      ],
      includedBenefits: [
        'Enduro MAX Bearings',
        'Creak-Free Guarantee',
        'Precision Drift Pressing'
      ]
    },
    {
      id: 'FWF-12',
      categoryNumber: 12,
      code: 'COMP-INST',
      name: 'Component Installation & Custom Upgrades',
      department: 'Components & Drivetrain',
      tagline: 'Professional installation of groupsets, cockpits, droppers & forks',
      description: 'Precision installation of customer-supplied or upgraded parts with calibrated torque specs and cable routing.',
      icon: 'pi pi-plus-circle',
      basePrice: 950,
      estimatedMinutes: 60,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX'],
      sopChecklist: [
        'Component compatibility & frame interface verification',
        'Internal cable routing with noise-damping foam sleeves',
        'Steerer tube cutting, facing & star nut installation',
        'Dropper post cable tension & hydraulic actuator setup',
        'Carbon assembly paste application on carbon-to-carbon junctions',
        'Final digital torque wrench verification across all clamping bolts'
      ],
      includedBenefits: [
        'Workmanship Warranty',
        'Stealth Cable Routing',
        'Carbon Grip Paste Applied'
      ]
    },
    {
      id: 'FWF-13',
      categoryNumber: 13,
      code: 'EBIKE-SVC',
      name: 'E-Bike Diagnostics & Electrical Service',
      department: 'Components & Drivetrain',
      tagline: 'Motor diagnostics, battery State-of-Health (% SoH), firmware update',
      description: 'Error code scanning, battery capacity testing, wiring harness inspection, and heavy-duty mechanical maintenance.',
      icon: 'pi pi-microchip',
      basePrice: 2400,
      estimatedMinutes: 100,
      isSignature: false,
      compatibleBikeTypes: ['Electric'],
      sopChecklist: [
        'Diagnostic error code readout via diagnostic interface',
        'Battery State-of-Health (% SoH) & cell balance scan',
        'Speed sensor magnet alignment & wiring harness check',
        'Motor torque-sensor calibration & firmware updates',
        'E-Bike heavy-duty brake pad & rotor thermal inspection',
        'Mid-drive motor mount torque inspection'
      ],
      includedBenefits: [
        'Full Electrical Health Scan',
        'Battery Life Report',
        'Firmware Upgrades'
      ]
    },
    {
      id: 'FWF-14',
      categoryNumber: 14,
      code: 'PRO-ASM',
      name: 'Bike Assembly & New Bike Setup',
      department: 'Bike Service',
      tagline: 'Unboxing, frame alignment, bearing prep & PRO ASSEMBLY certificate',
      description: 'Complete unboxing, grease prep, precision cable routing, wheel tensioning, and digital assembly QC certificate.',
      icon: 'pi pi-box',
      basePrice: 1800,
      estimatedMinutes: 110,
      isSignature: true,
      signatureBadge: 'PRO ASSEMBLY',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX', 'Other'],
      sopChecklist: [
        'Unboxing & freight damage inspection',
        'Headset & bottom bracket grease application check',
        'Component assembly with calibrated torque wrenches',
        'Wheel trueing & spoke tension balance out of factory box',
        'Brake caliper centering & pad burnishing',
        'Gear derailleur limit screw and B-tension setup',
        'Cockpit, saddle height & tyre pressure initial setup',
        'Issue FREEWHEEL FACTORY PRO ASSEMBLY QC Certificate'
      ],
      includedBenefits: [
        'Factory Torque Stamped',
        'Wheel True Out-of-Box',
        'Assembly QC Certificate'
      ]
    },
    {
      id: 'FWF-15',
      categoryNumber: 15,
      code: 'RACE-PREP',
      name: 'Race Preparation Service (24-48h Pre-Race)',
      department: 'Performance & Race',
      tagline: 'Signature 40-point race pass, wax recharge & emergency safety advisory',
      description: 'Conducted 24-48 hours before racing. Rigorous inspection yielding official RACE READY - PASS or remedial advisory.',
      icon: 'pi pi-trophy',
      basePrice: 2100,
      estimatedMinutes: 90,
      isSignature: true,
      signatureBadge: 'RACE READY — PASS',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel'],
      sopChecklist: [
        '40-point safety and fastener torque inspection',
        'Brake pad life check (>60% material thickness required for race pass)',
        'Drivetrain ultrasonic clean + race lubrication/wax top-up',
        'Tubeless sealant liquid volume check & race pressure dial-in',
        'Suspension lockout & damper performance under dynamic load',
        'High-speed test ride & race certification sign-off'
      ],
      includedBenefits: [
        'Official RACE READY Pass',
        'Emergency Remedial Flagging',
        'Same-Day Expedited Turnaround'
      ]
    },
    {
      id: 'FWF-16',
      categoryNumber: 16,
      code: 'MOBI-REC',
      name: 'Emergency / Doorstep & Roadside Rescue',
      department: 'Mobile & Event Support',
      tagline: 'Mobile workshop van dispatched to home, office or roadside',
      description: 'Doorstep maintenance van equipped with professional stands, truing fixtures, compressor, and common spares.',
      icon: 'pi pi-truck',
      basePrice: 1500,
      estimatedMinutes: 60,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX'],
      sopChecklist: [
        'Mobile workshop dispatched with certified technician',
        'On-site flat tyre fix & tubeless bead reseal',
        'Emergency chain repair / quick-link installation',
        'On-site gear hanger straightening & derailleur indexing',
        'Brake adjustment & safety check before rider departure'
      ],
      includedBenefits: [
        'Doorstep Convenience',
        'Fully Equipped Mobile Van',
        'On-Demand Dispatch'
      ]
    },
    {
      id: 'FWF-17',
      categoryNumber: 17,
      code: 'PASSPORT-INSP',
      name: 'Bicycle Health Inspection & Digital Passport',
      department: 'Inspection & Digital',
      tagline: 'Car-style comprehensive health report with 🟢 🟡 🔴 status badges',
      description: 'Evaluates Frame, Fork, Shock, Wheels, Drivetrain, Brakes, and Bearings with a persistent Digital Bicycle Passport.',
      icon: 'pi pi-id-card',
      basePrice: 900,
      estimatedMinutes: 45,
      isSignature: true,
      signatureBadge: 'DIGITAL BICYCLE PASSPORT',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX', 'Other'],
      sopChecklist: [
        'Frame & Fork structural check (Cracks, dents, corrosion)',
        'Wheels & Hub check (Rim wear, tension balance, bearing play)',
        'Drivetrain elongation micrometer test (Chain, cassette, chainrings)',
        'Brakes condition audit (Pad wear, rotor thickness, fluid moisture)',
        'Bearings audit (Headset, Bottom Bracket, Hubs, Linkages)',
        'Assign 🟢 GOOD / 🟡 ATTENTION REQUIRED / 🔴 REPLACE badges',
        'Generate Digital Passport QR code and Cloud Certificate'
      ],
      includedBenefits: [
        'Persistent Cloud Passport',
        'Component Health Badges',
        'Resale Value Booster'
      ]
    },
    {
      id: 'FWF-18',
      categoryNumber: 18,
      code: 'USED-INSP',
      name: 'Pre-Owned Bicycle Inspection (Used Bike Authority)',
      department: 'Inspection & Digital',
      tagline: 'Buyer/Seller verification for ₹50,000 to ₹10,00,000+ bicycles',
      description: 'Carbon frame ultrasound/tap test, component authenticity check, serial number audit, and fair market repair appraisal.',
      icon: 'pi pi-search',
      basePrice: 1750,
      estimatedMinutes: 75,
      isSignature: true,
      signatureBadge: 'USED BIKE AUTHORITY',
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Electric'],
      sopChecklist: [
        'Carbon frame & fork tap/ultrasound check for hidden delamination',
        'Suspension stanchion scratch and damper internal check',
        'Original component verification vs factory build sheet',
        'Serial number frame registration & stolen registry check',
        'Component wear life remaining appraisal (Drivetrain, tyres, rotors)',
        'Issue USED BIKE INSPECTION REPORT with estimated repair costs'
      ],
      includedBenefits: [
        'Carbon Delamination Audit',
        'Fair Market Valuation',
        'Buyer Purchase Confidence'
      ]
    },
    {
      id: 'FWF-19',
      categoryNumber: 19,
      code: 'ADV-DIAG',
      name: 'Advanced Diagnostic & Frame Alignment Lab',
      department: 'Inspection & Digital',
      tagline: 'Acoustic creak diagnosis, digital tensiometer reports & thread repair',
      description: 'Advanced troubleshooting for persistent noises, misalignments, frame thread chasing, and telemetry analysis.',
      icon: 'pi pi-chart-line',
      basePrice: 1300,
      estimatedMinutes: 60,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Electric'],
      sopChecklist: [
        'Acoustic stethoscope triangulation of mysterious bottom bracket / cockpit creaks',
        'Digital spoke tensiometer chart generation',
        'Bottom bracket & disc brake mount facing / thread chasing',
        'Electronic shifting telemetry data logs and shifter actuation diagnostics'
      ],
      includedBenefits: [
        'Acoustic Triangulation',
        'Facing & Chasing Tooling',
        'Telemetry Data Logs'
      ]
    },
    {
      id: 'FWF-20',
      categoryNumber: 20,
      code: 'DETAIL-SPA',
      name: 'Bicycle Detailing & Ceramic Protective Spa',
      department: 'Inspection & Digital',
      tagline: 'Biodegradable foam wash, deep drivetrain degreasing & ceramic coat',
      description: '3-tier detailing: Express Wash, Deep Detail, or Showroom Ceramic Coating for carbon/alloy matte & gloss finishes.',
      icon: 'pi pi-sun',
      basePrice: 1250,
      estimatedMinutes: 70,
      isSignature: false,
      compatibleBikeTypes: ['Road', 'Mountain', 'Gravel', 'Hybrid', 'Electric', 'BMX'],
      sopChecklist: [
        'Biodegradable pH-neutral active foam pre-soak and rinse',
        'Complete drivetrain ultrasonic degreasing and scrub',
        'Wheel, rim, and spoke hand-detail and brake rotor clean',
        'Compressed air drying of critical bearings & pivots',
        'Clay bar paint decontamination',
        'Hydrophobic ceramic coating application for matte/gloss finishes'
      ],
      includedBenefits: [
        'Hydrophobic Mud Repellent',
        'pH-Neutral Biodegradable',
        'Showroom Lustre Finish'
      ]
    }
  ]);

  // Sample Digital Passports for Customer Bicycles
  private passportsSignal = signal<DigitalBicyclePassport[]>([
    {
      id: 'PASSPORT-8912P',
      bikeId: 'BIKE-001',
      serialNumber: 'WTU230C8912P',
      frameNumber: 'FRM-TRK-98124',
      brand: 'Trek',
      model: 'Domane SL 6 (2023)',
      bikeType: 'Road',
      ownerName: 'Marcus Vance',
      ownerPhone: '+1 (555) 234-8901',
      overallHealthScore: 94,
      raceReadyStatus: 'PASS',
      lastInspectionDate: '2026-09-20',
      inspectorName: 'Alex Rivera (Master Tech)',
      verifiedTorqueSpecs: true,
      ultrasonicDrivetrainCertified: true,
      notes: 'Road-ready. Drivetrain clean and waxing verified. Chain elongation at 0.25% (excellent condition).',
      inspectionItems: [
        { componentName: 'OCLV Carbon Frame & Fork', category: 'Frame', status: 'GOOD', measuredWear: '0% wear', technicianNotes: 'No cracks or delamination found.' },
        { componentName: 'Bontrager Paradigm Disc Wheels', category: 'Wheels', status: 'GOOD', measuredWear: '<0.1mm lateral', technicianNotes: 'Tension balanced.' },
        { componentName: 'Shimano 105 Di2 Drivetrain', category: 'Drivetrain', status: 'GOOD', measuredWear: '0.25% chain elongation', technicianNotes: 'Ultrasonic wax applied.' },
        { componentName: 'Shimano 105 Hydraulic Brakes', category: 'Brakes', status: 'GOOD', measuredWear: '75% pad life remaining', technicianNotes: 'Bleed fresh.' },
        { componentName: 'T47 Bottom Bracket Bearings', category: 'Bearings', status: 'GOOD', measuredWear: 'Zero play', technicianNotes: 'Smooth rotation.' }
      ]
    },
    {
      id: 'PASSPORT-8920K',
      bikeId: 'BIKE-003',
      serialNumber: 'WSBC60108920K',
      frameNumber: 'FRM-SPZ-66710',
      brand: 'Specialized',
      model: 'Stumpjumper EVO',
      bikeType: 'Mountain',
      ownerName: 'Elena Rostova',
      ownerPhone: '+1 (555) 345-6712',
      overallHealthScore: 78,
      raceReadyStatus: 'CONDITIONAL',
      lastInspectionDate: '2026-09-20',
      inspectorName: 'David Chen (Suspension Specialist)',
      verifiedTorqueSpecs: true,
      ultrasonicDrivetrainCertified: false,
      notes: 'Lower leg fork service recommended due to 60+ trail hours. Chain showing 0.6% stretch.',
      inspectionItems: [
        { componentName: 'FACT 11m Carbon Chassis', category: 'Frame', status: 'GOOD', measuredWear: 'Surface clear', technicianNotes: 'Minor cosmetic downtube scratch.' },
        { componentName: 'Fox Float 36 Performance Elite Fork', category: 'Fork', status: 'ATTENTION_REQUIRED', measuredWear: '58 hours logged', technicianNotes: 'Recommend 50-hour lower-leg service.', actionRequired: 'Schedule Lower-Leg Service' },
        { componentName: 'Fox Float X Rear Shock', category: 'Shock', status: 'GOOD', measuredWear: 'Normal damping', technicianNotes: 'Sag set to 28%.' },
        { componentName: 'SRAM GX Eagle AXS Drivetrain', category: 'Drivetrain', status: 'ATTENTION_REQUIRED', measuredWear: '0.60% chain stretch', technicianNotes: 'Replace chain soon to save cassette.', actionRequired: 'Replace SRAM Eagle Chain' },
        { componentName: 'SRAM Code RS 4-Piston Brakes', category: 'Brakes', status: 'GOOD', measuredWear: '65% pad life', technicianNotes: 'Bite point firm.' },
        { componentName: 'Suspension Linkage Bearings', category: 'Bearings', status: 'GOOD', measuredWear: 'Smooth', technicianNotes: 'Pivots torqued to 15Nm.' }
      ]
    },
    {
      id: 'PASSPORT-84711M',
      bikeId: 'BIKE-007',
      serialNumber: 'SPE90284711M',
      frameNumber: 'FRM-SPZ-99120',
      brand: 'Specialized',
      model: 'Turbo Vado 4.0 E-Bike',
      bikeType: 'Electric',
      ownerName: 'Liam O’Connor',
      ownerPhone: '+1 (555) 678-9012',
      overallHealthScore: 88,
      raceReadyStatus: 'NOT_APPLICABLE',
      lastInspectionDate: '2026-09-19',
      inspectorName: 'David Chen (E-Bike Specialist)',
      verifiedTorqueSpecs: true,
      ultrasonicDrivetrainCertified: true,
      notes: 'Brose motor firmware updated to v7.4. Battery health tested at 96% State of Health.',
      inspectionItems: [
        { componentName: 'E5 Premium Aluminum Frame', category: 'Frame', status: 'GOOD', measuredWear: '0% wear', technicianNotes: 'Solid integrity.' },
        { componentName: 'Specialized 2.0 Motor & 710Wh Battery', category: 'Electrical', status: 'GOOD', measuredWear: '96% SoH (38 cycles)', technicianNotes: 'Firmware updated.' },
        { componentName: 'SRAM NX 11-Speed Drivetrain', category: 'Drivetrain', status: 'GOOD', measuredWear: '0.35% chain wear', technicianNotes: 'E-bike rated chain in good shape.' },
        { componentName: 'SRAM Level HD Brakes', category: 'Brakes', status: 'GOOD', measuredWear: '80% pad thickness', technicianNotes: 'Sintered pads installed.' },
        { componentName: '700x47c Pathfinder Sport Tyres', category: 'Wheels', status: 'GOOD', measuredWear: 'Tread deep', technicianNotes: 'Puncture protection intact.' }
      ]
    }
  ]);

  // Getters & Computed Signals
  readonly services = computed(() => this.servicesSignal());
  readonly passports = computed(() => this.passportsSignal());

  getServicesByDepartment(department: ServiceDepartment | 'All'): ServiceCatalogItem[] {
    if (department === 'All') return this.servicesSignal();
    return this.servicesSignal().filter(s => s.department === department);
  }

  getSignatureServices(): ServiceCatalogItem[] {
    return this.servicesSignal().filter(s => s.isSignature);
  }

  getServiceById(id: string): ServiceCatalogItem | undefined {
    return this.servicesSignal().find(s => s.id === id || s.code === id);
  }

  getPassportByBikeId(bikeId: string): DigitalBicyclePassport | undefined {
    return this.passportsSignal().find(p => p.bikeId === bikeId || p.serialNumber === bikeId || p.id === bikeId);
  }

  calculateQuote(serviceId: string, bikeType?: BicycleType, isDoorstep?: boolean): { base: number; multiplier: number; total: number; durationMinutes: number } {
    const service = this.getServiceById(serviceId);
    if (!service) return { base: 0, multiplier: 1, total: 0, durationMinutes: 0 };

    let multiplier = 1.0;
    let extraMinutes = 0;

    // E-Bikes require additional electrical safety and weight handling
    if (bikeType === 'Electric') {
      multiplier += 0.25;
      extraMinutes += 20;
    } else if (bikeType === 'Road' && service.department === 'Performance & Race') {
      multiplier += 0.10;
    }

    if (isDoorstep) {
      multiplier += 0.30;
      extraMinutes += 15;
    }

    const total = Math.round(service.basePrice * multiplier);
    return {
      base: service.basePrice,
      multiplier,
      total,
      durationMinutes: service.estimatedMinutes + extraMinutes
    };
  }

  savePassport(passport: DigitalBicyclePassport): void {
    const list = this.passportsSignal();
    const idx = list.findIndex(p => p.id === passport.id || p.bikeId === passport.bikeId);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = passport;
      this.passportsSignal.set(updated);
    } else {
      this.passportsSignal.set([passport, ...list]);
    }
  }
}
