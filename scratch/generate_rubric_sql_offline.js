/**
 * OFFLINE SQL GENERATOR
 * Uses the assessment IDs captured from previous successful DB queries.
 * No network connection needed — generates rubrics.sql from known data.
 * Run: node scratch/generate_rubric_sql_offline.js
 */

const fs = require('fs');
const path = require('path');

// ─── Known assessment mappings from DB query (2026-06-17) ──────────────────
const ASSESSMENTS = [
  // INTRODUCTION TO PROFESSIONAL CAREGIVING
  { id: '72f1ddbd-37e7-406d-bce6-5a6ec5f6eb27', module: 'INTRODUCTION TO PROFESSIONAL CAREGIVING', title: 'Lesson 5 knowledge check - FROM HELPER TO PROFESSIONAL' },
  { id: '31abceec-8652-4fb2-8549-621325b2c1fe', module: 'INTRODUCTION TO PROFESSIONAL CAREGIVING', title: 'Module Knowledge Check' },
  { id: 'c6c22236-3372-40b3-85ea-2c87bcd0a4c8', module: 'INTRODUCTION TO PROFESSIONAL CAREGIVING', title: 'Lesson 1 knowledge check - DEFINING PROFESSIONAL CAREGIVING' },
  { id: '0ddda141-23a2-4d4c-adb0-71d9c2b18fc2', module: 'INTRODUCTION TO PROFESSIONAL CAREGIVING', title: 'Lesson 2 knowledge check - NIGERIAN CARE ECOSYSTEM' },

  // ETHICS, DIGNITY AND PROFESSIONAL CONDUCT
  { id: 'a81c200d-a1ec-44fd-a809-1cf70e921cfe', module: 'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT', title: 'Lesson 1 knowledge check - FOUNDATION OF HUMAN DIGNITY' },
  { id: 'c1b9207c-72d5-46cb-9e51-5be3866c79a8', module: 'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT', title: 'Lesson 2 knowledge check - NIC CODE OF ETHICS' },
  { id: '97b7d936-8440-4bac-a9e8-61315ace2bb6', module: 'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT', title: 'Lesson 4 knowledge check - CONFIDENTIALITY' },
  { id: 'fac4f785-d366-4c43-97ee-1d3046a9ee3d', module: 'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT', title: 'Lesson 5 knowledge check - CULTURAL SENSITIVITY' },
  { id: '5b05e9c9-fd97-4753-91da-0ba1c8bbeb7f', module: 'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT', title: 'Module 2 Assessment' },

  // COMMUNICATION & INTERPERSONAL SKILLS
  { id: '8493b78e-6e81-4a6d-a30f-e87ec9cc38c5', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Lesson 1 knowledge check - FOUNDATIONS OF THERAPEUTIC COMMUNICATION' },
  { id: '81f216bb-d598-4ac0-9c69-1a5a74200a28', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Lesson 2 knowledge check - COMMUNICATION WITH ELDERLY PERSONS' },
  { id: 'e421ec5b-4d68-4924-9a8b-7ffd6410c7d8', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Lesson 3 knowledge check - CHILDREN & DISABILITIES' },
  { id: 'f3fba5e4-61e5-45ee-a4db-7199a999d7cd', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Lesson 4 knowledge check - DIFFICULT BEHAVIORS' },
  { id: '5d64df29-c342-4b3a-be00-e4ffc950d0f1', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Lesson 5 knowledge check - INTERPROFESSIONAL COMMUNICATION' },
  { id: '720a6ea7-ab62-43dc-b013-4ec0b60a1c80', module: 'COMMUNICATION & INTERPERSONAL SKILLS', title: 'Module 3 Assessment' },

  // PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)
  { id: 'c69c9a37-eac4-462b-8b26-6d6ec6f26d2b', module: 'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)', title: 'Lesson 1 knowledge check - PRINCIPLES OF SAFE AND DIGNIFIED PERSONAL CARE' },
  { id: '1bbfc679-97c0-462d-9561-f55f667fe01b', module: 'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)', title: 'Lesson 2 knowledge check - PERSONAL HYGIENE AND GROOMING' },
  { id: '8983e30c-7099-4864-9a73-b262bb57e595', module: 'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)', title: 'Lesson 4 knowledge check - DRESSING, POSITIONING' },
  { id: '72693ae9-cf10-4aa0-a353-7991dd913e8f', module: 'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)', title: 'Lesson 5 knowledge check - FEEDING ASSISTANCE' },
  { id: '7e89441b-806b-4650-acd8-f4d91110394d', module: 'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)', title: 'Module 4 Assessment' },

  // MOBILITY, TRANSFERS & POSITIONING
  { id: '176236fb-c237-49cc-b314-c58d5e76d364', module: 'MOBILITY, TRANSFERS & POSITIONING', title: 'Lesson 1 knowledge check - PRINCIPLES OF BODY MECHANICS' },
  { id: 'ffda991f-56d9-45a5-b867-0cc2bf573ecc', module: 'MOBILITY, TRANSFERS & POSITIONING', title: 'Lesson 2 knowledge check - SAFE TRANSFER TECHNIQUES' },
  { id: '7ba01f08-29b1-472f-b36f-14700f8e5091', module: 'MOBILITY, TRANSFERS & POSITIONING', title: 'Lesson 4 knowledge check - BED MOBILITY' },
  { id: '0a632a90-3224-432b-bd42-63a7ca7d8d04', module: 'MOBILITY, TRANSFERS & POSITIONING', title: 'Lesson 5 knowledge check - FALL PREVENTION' },

  // HEALTH, HYGIENE & INFECTION PREVENTION
  { id: '1b358121-b67e-4e3a-8735-b55ce9ba0517', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Lesson 1 knowledge check - CHAIN OF INFECTION MODEL' },
  { id: 'c4120be4-e169-4d73-a99d-ce0f1b413bb0', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Lesson 2 knowledge check - HAND HYGIENE TECHNIQUES' },
  { id: 'cb082257-b7c2-499d-9317-ca5dd455d858', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Lesson 3 knowledge check - PPE' },
  { id: 'aa48fcdc-7212-451b-b7d5-3e78f585ad79', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Lesson 4 knowledge check - ENVIRONMENTAL HYGIENE' },
  { id: '186aabe7-d055-4359-b7b0-1e4a3ba12499', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Lesson 5 knowledge check - WASTE MANAGEMENT' },
  { id: '412e37d3-5ab6-4ff1-b9f5-529d710b32d6', module: 'HEALTH, HYGIENE & INFECTION PREVENTION', title: 'Module 6 knowledge check' },

  // BASIC HEALTH SUPPORT & MEDICATION AWARENESS
  { id: '5d40298b-e6e9-4d9e-a127-c7fa642b43ad', module: 'BASIC HEALTH SUPPORT & MEDICATION AWARENESS', title: 'Lesson 1 knowledge check - RECOGNIZING COMMON HEALTH CHANGES' },
  { id: '4355d698-2329-4ff2-8502-fdd3d5457920', module: 'BASIC HEALTH SUPPORT & MEDICATION AWARENESS', title: 'Lesson 2 knowledge check - MONITORING VITAL SIGNS' },
  { id: '341b17a1-7d7b-4a0e-97af-b02a44cbac76', module: 'BASIC HEALTH SUPPORT & MEDICATION AWARENESS', title: 'Lesson 4 knowledge check - TREATMENT ADHERENCE' },
  { id: '9121becd-ff86-45b4-a9fb-419bd170617a', module: 'BASIC HEALTH SUPPORT & MEDICATION AWARENESS', title: 'Lesson 5 knowledge check - ESCALATING CONCERNS' },
  { id: '9ca0c9bb-e581-445f-b009-0b150f316984', module: 'BASIC HEALTH SUPPORT & MEDICATION AWARENESS', title: 'Module 7 Assessment' },

  // SAFETY, EMERGENCIES & INCIDENT REPORTING
  { id: 'f5200329-82c0-4f2f-bf94-c9b033391afd', module: 'SAFETY, EMERGENCIES & INCIDENT REPORTING', title: 'Lesson 1 knowledge check - HOME SAFETY RISK ASSESSMENT' },
  { id: 'd92c2726-71f1-4115-8f46-1ff724a59f26', module: 'SAFETY, EMERGENCIES & INCIDENT REPORTING', title: 'Lesson 2 knowledge check - FIRE AND ELECTRICAL SAFETY' },
  { id: '61f85645-a79f-4cad-8dc6-a4b5e34ab883', module: 'SAFETY, EMERGENCIES & INCIDENT REPORTING', title: 'Lesson 4 knowledge check - EMERGENCY PREPAREDNESS' },
  { id: 'c317da92-5547-40aa-be1f-622580ff8558', module: 'SAFETY, EMERGENCIES & INCIDENT REPORTING', title: 'Lesson 5 knowledge check - INCIDENT REPORTING' },
  { id: '0e6bc01b-c6dd-47d4-b2ba-a09cb2c4698c', module: 'SAFETY, EMERGENCIES & INCIDENT REPORTING', title: 'Module 8 Assessment' },

  // SAFEGUARDING, ABUSE & RIGHTS PROTECTION
  { id: '0c7384b8-f4e3-4b96-92f6-8e6a7f0129ce', module: 'SAFEGUARDING, ABUSE & RIGHTS PROTECTION', title: 'Lesson 1 knowledge check - UNDERSTANDING ABUSE AND NEGLECT' },
  { id: '37857471-442f-43bb-90ba-fb038b1749cb', module: 'SAFEGUARDING, ABUSE & RIGHTS PROTECTION', title: 'Lesson 2 knowledge check - LEGAL FRAMEWORK AND SAFEGUARDING' },
  { id: '0ac821fe-1e3d-4595-b77c-cb55c0fa7edf', module: 'SAFEGUARDING, ABUSE & RIGHTS PROTECTION', title: 'Lesson 4 knowledge check - RESPONDING & REPORTING' },
  { id: 'b30d8063-11f5-49df-ada8-6c438f3318cb', module: 'SAFEGUARDING, ABUSE & RIGHTS PROTECTION', title: 'Lesson 5 knowledge check - PREVENTION STRATEGIES' },
  { id: '259aa03c-9d40-4e07-bd82-0488b309389d', module: 'SAFEGUARDING, ABUSE & RIGHTS PROTECTION', title: 'Module 9 Assessment' },

  // UNDERSTANDING DISABILITY AND INCLUSIVE CARE
  { id: 'cafbad62-a75a-4244-bd6e-37d076ec4a68', module: 'UNDERSTANDING DISABILITY AND INCLUSIVE CARE', title: 'Lesson 1 knowledge check - DEFINITIONS, MODELS, AND PERSPECTIVES' },
  { id: 'a030ae85-c1ef-457e-87b3-449352b43bec', module: 'UNDERSTANDING DISABILITY AND INCLUSIVE CARE', title: 'Lesson 2 knowledge check - TYPES OF DISABILITIES' },
  { id: 'b5bf4584-3026-4ea7-949f-2bc9434d99de', module: 'UNDERSTANDING DISABILITY AND INCLUSIVE CARE', title: 'Lesson 4 knowledge check - DISABILITY RIGHTS' },
  { id: '210c5cb2-2be9-4862-989a-3ba6b7cdbf6c', module: 'UNDERSTANDING DISABILITY AND INCLUSIVE CARE', title: 'Module 1 Assessment' },

  // PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES
  { id: '21a651b1-7c46-40cb-8faa-9df2bd9a04a4', module: 'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES', title: 'Lesson 1 knowledge check - PRINCIPLES OF PERSON-CENTERED CARE' },
  { id: '696c6db8-a708-4979-9ff9-495e0dc707ba', module: 'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES', title: 'Lesson 2 knowledge check - SUPPORTING INDEPENDENCE' },
  { id: '85991882-f07d-4acf-8405-370aca0e037b', module: 'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES', title: 'Lesson 4 knowledge check - INDIVIDUALIZED CARE PLANS' },
  { id: '9b00ad61-e365-4813-9da9-5a5ce5036f11', module: 'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES', title: 'Lesson 5 knowledge check - WORKING WITH FAMILIES' },
  { id: '767b3fef-d91b-4f55-8016-d4c5ad5b52d5', module: 'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES', title: 'Module Assessment' },

  // SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES
  { id: '3d9448cf-fb93-4b37-bd2a-409eff098185', module: 'SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES', title: 'Lesson 1 knowledge check - UNDERSTANDING MOBILITY IMPAIRMENTS' },
  { id: '61694146-2082-4235-8101-38ed680e49b2', module: 'SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES', title: 'Lesson 2 knowledge check - SAFE TRANSFERS AND POSITIONING' },
  { id: 'd44aafa4-5b25-4efc-ad8e-c7edaf69150d', module: 'SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES', title: 'Lesson 4 knowledge check - PRESSURE INJURIES' },
  { id: '279301dd-8276-4d12-b925-f58658cb74b5', module: 'SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES', title: 'Module 3 Assessment' },

  // INTELLECTUAL AND DEVELOPMENTAL DISABILITIES
  { id: '802f98bd-df2e-4bdc-9777-417f1a9359bb', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Lesson 1 knowledge check - UNDERSTANDING INTELLECTUAL DISABILITIES' },
  { id: 'eda484cc-6625-4e5a-8d8f-549b9831665c', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Lesson 2 knowledge check - AUTISM SPECTRUM CONDITIONS' },
  { id: 'd339b5fa-deff-47ff-acf5-90ee22288a6c', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Lesson 3 Knowledge check - COMMUNICATION TECHNIQUES' },
  { id: '3b743fd2-54a6-4e74-b453-b217121b63cf', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Lesson 4 knowledge check - SUPPORTING LEARNING' },
  { id: '5a566696-9d75-4a03-acbd-3181934333f6', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Lesson 5 knowledge check - CHALLENGING BEHAVIORS' },
  { id: '47e70bbd-d5e3-4aca-a52b-461d8ca81748', module: 'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES', title: 'Module 4 Assessment' },

  // SENSORY DISABILITIES AND COMMUNICATION SUPPORT
  { id: 'c0fa6851-9403-4fd5-9aa3-92e5bdfa1193', module: 'SENSORY DISABILITIES AND COMMUNICATION SUPPORT', title: 'Lesson 1 knowledge check - UNDERSTANDING VISUAL IMPAIRMENT' },
  { id: 'c1cc3e80-56fb-4fa8-92bd-8f5156edb3ae', module: 'SENSORY DISABILITIES AND COMMUNICATION SUPPORT', title: 'Lesson 2 knowledge check - UNDERSTANDING HEARING IMPAIRMENT' },
  { id: '6c3d28a7-95a9-4428-a6fc-ef425bbb6447', module: 'SENSORY DISABILITIES AND COMMUNICATION SUPPORT', title: 'Lesson 3 knowledge check - COMMUNICATION TECHNIQUES' },
  { id: '709afaae-91bf-4b59-a711-32b308a8566a', module: 'SENSORY DISABILITIES AND COMMUNICATION SUPPORT', title: 'Lesson 4 knowledge check - ORIENTATION & MOBILITY' },
  { id: '2753933d-3c18-4959-8305-40f03158371f', module: 'SENSORY DISABILITIES AND COMMUNICATION SUPPORT', title: 'Lesson 5 knowledge check - REDUCING ISOLATION' },

  // SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY
  { id: '0794d161-19c4-4e8d-a8f4-bbe6ffcb9cab', module: 'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY', title: 'Lesson 1 knowledge check - SAFEGUARDING VULNERABLE PERSONS' },
  { id: '793f19eb-2462-4586-89a1-7300b39209d4', module: 'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY', title: 'Lesson 2 knowledge check - RECOGNIZING ABUSE AND EXPLOITATION' },
  { id: '1ad7b5d4-d584-4084-812b-3c77c7bcd0db', module: 'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY', title: 'Lesson 3 knowledge check - PROFESSIONAL BOUNDARIES' },
  { id: '0b4e3253-ddad-46d0-9798-39a05686c0cb', module: 'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY', title: 'Lesson 4 knowledge check - DOCUMENTATION & REPORTING' },
  { id: '8696086d-1070-4f41-a807-1d7ffbcbdf83', module: 'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY', title: 'Lesson 5 knowledge check - CAREGIVER STRESS MANAGEMENT' },

  // DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT
  { id: '4fed8bd4-d162-454b-a32e-06ff46e64845', module: 'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT', title: 'Lesson 1 knowledge check - BASIC CARE DOCUMENTATION' },
  { id: '5cce538c-8882-4638-a9ec-5616f0cefc1d', module: 'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT', title: 'Lesson 2 knowledge check - TIME MANAGEMENT AND TEAMWORK' },
  { id: '1a2d2dca-3407-4d81-a085-95be2572ef87', module: 'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT', title: 'Lesson 4 knowledge check - SELF-CARE' },
  { id: '87a41f1c-e9a2-49c4-8ba9-4a6fa1a7c063', module: 'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT', title: 'Lesson 5 knowledge check - CAREER DEVELOPMENT' },
  { id: '84ea47cf-5ae6-4fc6-944e-1d35e3eeee2c', module: 'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT', title: 'Module 10 Assessment' },
];

const LESSON_CHECKS = [
  // INTRODUCTION TO PROFESSIONAL CAREGIVING — lesson 1,2,3,4,5 checks
  // From the output: 16 x Lesson 1 checks total across all modules
  // We need to pick the ones from each specific module.
  // Since we can't re-query, we include ALL lesson checks with their correct module
  // based on the full output list above. Already covered above.
];

// ─── RUBRICS ──────────────────────────────────────────────────────────────────
const RUBRICS = {
  'INTRODUCTION TO PROFESSIONAL CAREGIVING': `NIC Professional Caregiving Standards — Rubric

CONTEXT: This module establishes the transition from informal helper to NIC-certified professional caregiver. Responses are assessed on the student's understanding of professional identity, scope of practice, and the Nigerian home-care environment.

SCORING GUIDE (out of the assigned question marks):
▸ EXCELLENT (90–100%): Response clearly distinguishes the professional caregiver role from informal helping. Student demonstrates understanding of NIC Code of Practice, articulates scope of practice boundaries, and shows how cultural dynamics (family authority, traditional remedies, limited supervision) shape professional conduct in Nigeria. Uses correct terminology. Provides specific, contextualised examples.
▸ GOOD (70–89%): Covers key professional identity points with minor gaps. Shows understanding of scope of practice but may not fully address the Nigerian cultural context or boundary-setting scenarios. Examples present but less precise.
▸ SATISFACTORY (50–69%): Covers basic concepts but lacks depth. May confuse caregiver scope with clinical roles. General statements without examples. Meets minimum standard.
▸ UNSATISFACTORY (0–49%): Vague, incorrect, or off-topic. Fails to define professional identity or scope. No engagement with Nigerian context. Critical safety understanding absent.

KEY COMPETENCIES TO ASSESS:
1. Can the student define the professional caregiver role versus that of a family helper or clinical nurse?
2. Do they understand the NIC principle: "Know your role, know your limits, escalate when necessary"?
3. Can they identify at least two scenarios where professional boundaries apply in a Nigerian home?
4. Do they show awareness of continuous professional development (CPD) obligations?
5. Do they demonstrate understanding of client-centred care as a professional standard?

AUTOMATIC FAIL: Student suggests performing medical procedures (injections, IV, medication prescribing) as part of the caregiver role without flagging this as outside scope.`,

  'ETHICS, DIGNITY AND PROFESSIONAL CONDUCT': `NIC Ethics & Dignity Standards — Rubric

CONTEXT: This module covers the ethical framework governing NIC-certified care: autonomy, beneficence, non-maleficence, justice, confidentiality, and dignity. Responses must reflect practical application in Nigerian home-care contexts where family dynamics and cultural norms often challenge these principles.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student names and correctly applies core ethical principles. Demonstrates clear professional boundaries, handles dual-role pressure (family vs. client) with nuance, and articulates how to uphold client dignity in resource-limited Nigerian settings. Shows capacity to resolve ethical dilemmas using a structured approach.
▸ GOOD (70–89%): Core ethical principles covered with minor omissions. Good understanding of dignity and confidentiality. May lack depth on navigating family-led decision-making.
▸ SATISFACTORY (50–69%): Basic ethical principles stated but not applied. Dignity discussed at surface level. Little engagement with Nigerian-specific ethical challenges.
▸ UNSATISFACTORY (0–49%): Incorrect or missing ethical principles. No meaningful discussion of dignity or confidentiality.

KEY COMPETENCIES TO ASSESS:
1. Can the student correctly define and apply autonomy, beneficence, non-maleficence, and justice?
2. Do they articulate what client dignity looks like in personal care (privacy, choice, language, modesty)?
3. Can they explain how to maintain confidentiality when Nigerian family members demand information?
4. Do they demonstrate a step-by-step approach to ethical dilemmas (identify → gather facts → evaluate → act → escalate)?
5. Do they show how cultural respect and professional ethics can coexist without compromising client safety?

AUTOMATIC FAIL: Student indicates they would share client medical information with unauthorised family members, or that family instructions override patient safety.`,

  'COMMUNICATION & INTERPERSONAL SKILLS': `NIC Communication Standards — Rubric

CONTEXT: Effective communication is a core clinical safety skill. This module covers verbal, non-verbal, and written communication; structured reporting (SBAR, SOAP); family and interprofessional communication; managing difficult conversations in Nigerian settings.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates command of active listening, non-verbal communication, and structured communication tools (SBAR/SOAP). Shows how to adapt communication for clients with disabilities, dementia, or language differences. Provides a correct SBAR-style report in scenario questions. Demonstrates de-escalation strategies. Understands documentation as a communication tool.
▸ GOOD (70–89%): Communication principles sound. SBAR/SOAP attempted but may have gaps. Good on interpersonal skills; weaker on written documentation standards or disability-specific adaptations.
▸ SATISFACTORY (50–69%): Covers basic verbal communication. SBAR not used or used incorrectly. Limited awareness of non-verbal cues.
▸ UNSATISFACTORY (0–49%): No evidence of structured communication skills. No awareness of documentation as a clinical tool.

KEY COMPETENCIES TO ASSESS:
1. Does the student use SBAR or equivalent structured reporting in scenario responses?
2. Do they identify at least two communication adaptations for clients with cognitive or physical disabilities?
3. Can they explain the difference between subjective and objective documentation?
4. Do they demonstrate strategies for communicating professionally with authoritative Nigerian family members?
5. Do they show awareness of non-verbal cues as a clinical safety tool?`,

  'PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)': `NIC ADL & Personal Care Standards — Rubric

CONTEXT: This module covers the safe, dignified provision of Activities of Daily Living (ADLs): bathing, grooming, dressing, oral hygiene, feeding assistance, toileting, and skin care. Emphasis on promoting maximum client independence and adapting to resource-limited Nigerian home environments.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates step-by-step knowledge of at least three ADL procedures with correct safety and dignity considerations (gaining consent, ensuring privacy, encouraging participation, monitoring skin). Shows adaptation to limited resources (no running water, limited equipment). Demonstrates awareness of pressure injury prevention. Integrates cultural sensitivity.
▸ GOOD (70–89%): ADL procedures generally correct with minor safety omissions. Dignity principles present. Limited Nigerian context adaptation.
▸ SATISFACTORY (50–69%): Basic ADL knowledge demonstrated but lacks procedural detail or dignity considerations. Safety points superficial.
▸ UNSATISFACTORY (0–49%): Incorrect or unsafe ADL procedures. Dignity or privacy not mentioned. Missing understanding of maintaining client independence.

KEY COMPETENCIES TO ASSESS:
1. Does the student include consent, privacy, and client participation as standard ADL steps?
2. Are safety considerations (fall prevention, skin integrity, aspiration risk) addressed?
3. Can they describe at least one adaptation for ADLs without running water or standard supplies?
4. Do they promote client independence (offering choices, assisting rather than doing for)?
5. Is accurate documentation of ADL observations included?`,

  'MOBILITY, TRANSFERS & POSITIONING': `NIC Safe Mobility & Positioning Standards — Rubric

CONTEXT: This module covers safe patient handling: bed mobility, transfer techniques, repositioning schedules, fall prevention, and emergency response to falls. Includes pressure injury staging and prevention.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly describes body mechanics for safe lifting/transfer, explains the 2-hourly repositioning rule for immobile patients, identifies pressure injury risk sites and prevention strategies. Demonstrates a structured fall-response protocol. Adapts techniques to environments without specialist equipment.
▸ GOOD (70–89%): Safe transfer principles present, repositioning understood. May miss specific pressure injury stages or escalation trigger points.
▸ SATISFACTORY (50–69%): Basic awareness of safe moving. Repositioning mentioned but not scheduled. Fall response incomplete.
▸ UNSATISFACTORY (0–49%): Unsafe moving described (e.g., dragging patient). No awareness of pressure injury prevention. No escalation plan for falls.

KEY COMPETENCIES TO ASSESS:
1. Does the student apply correct body mechanics (feet apart, back straight, pivot, no twisting)?
2. Is the 2-hourly repositioning schedule for immobile patients mentioned?
3. Are at least four pressure injury risk sites identified (sacrum, heels, hips, elbows)?
4. Is the correct post-fall response described (assess LOC first, do not rush to move, call for help, document)?
5. Does the student adapt techniques to homes without hoists, slide sheets, or adjustable beds?`,

  'HEALTH, HYGIENE & INFECTION PREVENTION': `NIC Infection Control & Hygiene Standards — Rubric

CONTEXT: This module covers hand hygiene (WHO 5 Moments), PPE use and disposal, environmental cleaning, waste management, and infection control in resource-limited Nigerian homes.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly applies WHO 5 Moments of Hand Hygiene and explains clinical rationale. Correctly sequences donning and doffing of PPE. Explains appropriate waste segregation. Demonstrates safe adaptation to resource-limited settings. Identifies cross-infection risks in Nigerian home environments.
▸ GOOD (70–89%): WHO moments and PPE use correct with minor gaps. Waste management understood. Limited Nigerian adaptation.
▸ SATISFACTORY (50–69%): Hand hygiene and PPE covered at basic level. Waste management superficial.
▸ UNSATISFACTORY (0–49%): Incorrect or absent hand hygiene steps. PPE misused. No awareness of cross-infection risks.

KEY COMPETENCIES TO ASSESS:
1. Can the student name and justify the WHO 5 Moments of Hand Hygiene?
2. Is PPE donning/doffing sequence correct (gown → mask → goggles → gloves; reverse for doffing)?
3. Are clinical waste (sharps, soiled dressings) and general waste correctly differentiated?
4. Does the student propose at least one safe adaptation for infection control without running water?
5. Are high-touch surfaces and cross-contamination routes identified in a typical Nigerian home?`,

  'BASIC HEALTH SUPPORT & MEDICATION AWARENESS': `NIC Health Monitoring & Medication Awareness Standards — Rubric

CONTEXT: This module covers vital sign monitoring, medication awareness (not administration), recognising medication side effects, polypharmacy risks, and knowing when and how to escalate health concerns to clinical professionals. The caregiver observes and facilitates — never prescribes or injects.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies normal vital sign ranges and describes what deviations indicate. Articulates the caregiver medication role: reminder, observation of effect, reporting — never administering without instruction or touching controlled drugs. Correctly identifies at least three red flags for escalation. Uses SBAR for escalation. Demonstrates awareness of polypharmacy and drug-herb interactions.
▸ GOOD (70–89%): Vital sign ranges and medication role mostly correct. Escalation triggers identified but may miss specific thresholds. SBAR used but incomplete.
▸ SATISFACTORY (50–69%): Basic vital sign awareness. Medication role understood at surface level. Escalation triggers vague.
▸ UNSATISFACTORY (0–49%): Incorrect vital sign ranges. Student suggests caregiver may prescribe, advise on dosage, or administer injections. No escalation awareness.

KEY COMPETENCIES TO ASSESS:
1. Normal adult vital sign ranges: Temp 36.5–37.5°C | Pulse 60–100 bpm | RR 12–20 bpm | BP 90–140/60–90 mmHg | SpO2 95–100%
2. Does the student clearly state they do NOT prescribe, administer injections, or adjust dosages?
3. Are at least three specific clinical escalation triggers identified?
4. Is SBAR used for the escalation communication scenario?
5. Is the risk of combining traditional herbal remedies (Agbo) with prescription medications acknowledged?

AUTOMATIC FAIL: Student suggests administering medication by injection, adjusting prescribed doses, or using herbal remedies as medication substitutes without medical oversight.`,

  'SAFETY, EMERGENCIES & INCIDENT REPORTING': `NIC Emergency Response & Incident Reporting Standards — Rubric

CONTEXT: This module covers recognition and first-line response to medical emergencies (stroke, hypoglycaemia, seizures, cardiac events, respiratory distress), fall management, incident documentation, and legal reporting obligations under Nigerian infrastructure constraints.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies presenting signs of at least three emergencies and provides safe, within-scope first-line responses. Demonstrates awareness of the Nigerian context (delayed EMS, traffic, resource gaps). Correctly completes a simulated incident report. Articulates legal documentation obligations.
▸ GOOD (70–89%): Emergency recognition and response broadly correct with minor gaps. Incident report mostly complete. Nigerian context acknowledged.
▸ SATISFACTORY (50–69%): Recognises major emergencies but responses may include unsafe actions. Incident report incomplete.
▸ UNSATISFACTORY (0–49%): Incorrect or dangerous emergency response. No incident documentation skills. Scope of practice violated.

KEY COMPETENCIES TO ASSESS:
1. FAST acronym for stroke (Face drooping, Arm weakness, Speech difficulty, Time to call)?
2. Correct hypoglycaemia management: conscious → oral glucose; unconscious → do NOT give anything by mouth, escalate immediately?
3. Correct seizure response: protect from injury, do NOT restrain or put anything in mouth, time the seizure, escalate?
4. Does the incident report include: time/date, client name, what happened, witnesses, action taken, person notified?
5. Is the student's response to a fall correct: assess consciousness first, do not rush to lift?

AUTOMATIC FAIL: Placing objects in mouth during seizure; giving food/drink to unconscious patient; moving a fallen patient without first assessing for injury.`,

  'SAFEGUARDING, ABUSE & RIGHTS PROTECTION': `NIC Safeguarding & Client Rights Standards — Rubric

CONTEXT: This module covers recognising, responding to, and reporting all forms of abuse and neglect. It covers client rights, whistleblowing, safeguarding cultures, and the unique challenges of reporting abuse within Nigerian family and community structures.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies all major abuse types with Nigerian-specific examples. Demonstrates a clear reporting pathway: observe → document objectively → report to supervisor/NIC → do not promise secrecy to client. Shows understanding of legal duty to report, even when the abuser is a family elder. Proposes safeguarding culture strategies.
▸ GOOD (70–89%): Major abuse types identified correctly. Reporting pathway clear. Legal duty acknowledged. Nigerian-specific challenges partially addressed.
▸ SATISFACTORY (50–69%): Physical and emotional abuse recognised. Reporting pathway incomplete. Does not address challenge of reporting family members.
▸ UNSATISFACTORY (0–49%): Abuse types confused or incomplete. Reporting absent or delayed. Client rights not addressed.

KEY COMPETENCIES TO ASSESS:
1. Are all six abuse types named: physical, emotional, sexual, financial, organisational, self-neglect?
2. Is the reporting pathway correct: do NOT investigate alone, do NOT promise secrecy, DO document objectively, DO report to supervisor?
3. Does the student understand that family members can be perpetrators?
4. Is the concept of whistleblowing protection understood?
5. Are at least three client rights articulated (dignity, consent, privacy, freedom from abuse, right to complain)?

AUTOMATIC FAIL: Student says they would keep observed abuse private, handle it alone without reporting, or that cultural norms justify any form of client harm or neglect.`,

  'UNDERSTANDING DISABILITY AND INCLUSIVE CARE': `NIC Disability & Inclusive Care Standards — Rubric

CONTEXT: This module introduces the social model of disability, disability rights in Nigeria, inclusive care principles, and the ethical obligations of a caregiver working with persons with physical, intellectual, or sensory disabilities.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly distinguishes the medical model (disability as problem to fix) from the social model (disability as context of barriers). Demonstrates understanding of disability rights as human rights. Shows how to deliver inclusive care that promotes autonomy and avoids paternalism. Identifies at least three barriers to inclusion in Nigerian settings. Uses empowerment language.
▸ GOOD (70–89%): Social vs. medical model distinguished. Rights framework mentioned. Inclusive care principles applied. May lack specificity on Nigerian barriers.
▸ SATISFACTORY (50–69%): Basic awareness of inclusive care. Disability treated primarily through the medical model. Rights language absent.
▸ UNSATISFACTORY (0–49%): Disability viewed only through a charitable or medical lens. No rights framework. Stereotyping or ableist assumptions present.

KEY COMPETENCIES TO ASSESS:
1. Does the student correctly explain the social model of disability?
2. Are disability rights framed as human rights, not charity?
3. Is person-first language used (person with a disability)?
4. Does the student identify at least two environmental barriers to inclusion a caregiver can address?
5. Is client autonomy and self-determination central to the care approach described?`,

  'PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES': `NIC Person-Centred Care Standards (Disability) — Rubric

CONTEXT: This module focuses on developing individualised care plans for people with disabilities, working collaboratively with families and care teams, and ensuring the client voice remains central to all care decisions.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates how to conduct a needs assessment, co-produce a care plan with the client, and review it over time. Shows understanding of the interdisciplinary team's roles. Articulates how to handle family members who override the client's stated preferences. References NIC documentation standards.
▸ GOOD (70–89%): Care plan elements understood. Person-centred principles applied. Family collaboration described but client primacy may not be consistently maintained.
▸ SATISFACTORY (50–69%): Care plan concepts present but generic. Person-centred language used but not applied to specific scenarios.
▸ UNSATISFACTORY (0–49%): Care is described as caregiver-led or family-led with no client voice. No care plan elements.

KEY COMPETENCIES TO ASSESS:
1. Does the care plan include: assessment, goals, specific activities, responsibilities, and review dates?
2. Is the client identified as the primary participant in care planning, not a passive recipient?
3. Does the student describe how to handle conflict between client preferences and family wishes?
4. Are at least two interdisciplinary team members identified and their roles described?
5. Is the care plan documented as a living, regularly reviewed document?`,

  'SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES': `NIC Physical Disability Support Standards — Rubric

CONTEXT: This module covers safe support for clients with physical disabilities including hemiplegia, paraplegia, limb differences, and degenerative conditions. Topics include adaptive equipment, pressure injury prevention for wheelchair users, rehabilitation support, and preventing secondary complications.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates knowledge of adaptive equipment and when each applies. Correctly describes pressure injury prevention for wheelchair users (pressure relief every 15–30 mins). Shows awareness of secondary complication prevention (ROM exercises, hydration for UTI prevention, compression for DVT risk). Adapts support to Nigerian home context without specialist equipment.
▸ GOOD (70–89%): Adaptive equipment and pressure relief understood. Secondary complication prevention partially addressed. Physiotherapy collaboration mentioned.
▸ SATISFACTORY (50–69%): Basic physical disability support described. Pressure injury prevention superficial. Secondary complications not addressed.
▸ UNSATISFACTORY (0–49%): Unsafe support described. No awareness of secondary complications. Equipment misused.

KEY COMPETENCIES TO ASSESS:
1. Is pressure relief for wheelchair users described (15–30 minute intervals, weight shifts)?
2. Are at least two secondary complications of immobility identified (contractures, DVT, pressure injuries, UTI, pneumonia)?
3. Is range-of-motion (ROM) exercise differentiated from physiotherapy (caregiver supports, therapist prescribes)?
4. Does the student describe at least one adaptive equipment item correctly?
5. Is the importance of physiotherapy care plan compliance articulated?`,

  'INTELLECTUAL AND DEVELOPMENTAL DISABILITIES': `NIC Intellectual & Developmental Disability Support Standards — Rubric

CONTEXT: This module covers care for individuals with intellectual disabilities (ID), autism spectrum conditions (ASC), Down syndrome, and other developmental conditions. Focus: communication adaptations, positive behaviour support, daily skills support, and the dignity and rights of adults with IDD.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates communication adaptations appropriate to IDD (simple sentences, visual aids, AAC symbols, consistent routines). Correctly describes Positive Behaviour Support (PBS) principles — understanding the function of behaviour before responding. Shows de-escalation techniques and explicitly states physical restraint is a last resort requiring authorisation. Promotes daily skills development.
▸ GOOD (70–89%): Communication adaptations present and appropriate. PBS principles mentioned. De-escalation described. Restraint caution stated.
▸ SATISFACTORY (50–69%): Basic communication adjustments mentioned. Behaviour treated reactively. Restraint not explicitly addressed.
▸ UNSATISFACTORY (0–49%): Communication not adapted. Behaviour managed punitively. Restraint described as a routine response.

KEY COMPETENCIES TO ASSESS:
1. Does the student name at least two appropriate communication adaptations for IDD (visual schedules, simplified language, AAC, consistent routines)?
2. Is behaviour understood as communication (student asks "what is the behaviour communicating?" before responding)?
3. Is physical restraint identified as a serious last resort requiring specific authorisation — never a first response?
4. Does the student describe at least one strategy for supporting daily living skill development?
5. Are the rights and capacity of adults with IDD respected?

AUTOMATIC FAIL: Student describes physical restraint as a routine or first-line behaviour management strategy.`,

  'SENSORY DISABILITIES AND COMMUNICATION SUPPORT': `NIC Sensory Disability & Communication Standards — Rubric

CONTEXT: This module covers care for clients with visual, hearing, or combined sensory impairments. Topics include environmental orientation, safe guiding techniques, communication strategies for Deaf and hard-of-hearing clients, reducing isolation, and adapting daily care to sensory needs.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly describes the sighted guide technique (client holds caregiver arm, not the reverse). Demonstrates environmental orientation strategies for visually impaired clients (clock-face plate descriptions, consistent room layout, verbal narration). Shows communication adaptations for hearing-impaired clients (face client, speak clearly, written notes). Identifies risk of social isolation in sensory disability and proposes specific inclusion strategies.
▸ GOOD (70–89%): Sighted guide technique and hearing communication adaptations correct. Orientation strategies present. Isolation risk acknowledged.
▸ SATISFACTORY (50–69%): Basic awareness of visual and hearing disability. Sighted guide technique may be incorrect. Communication adaptations generic.
▸ UNSATISFACTORY (0–49%): Incorrect guiding technique (pulling or steering). No communication adaptations. Sensory disability treated as cognitive impairment.

KEY COMPETENCIES TO ASSESS:
1. Is the correct sighted guide technique described (client holds caregiver arm at elbow, caregiver walks half a step ahead)?
2. Are clock-face plate descriptions or verbal narration used for visually impaired clients during meals?
3. Are at least three communication strategies for hearing-impaired clients described (face client, reduce background noise, written communication, clear lip movement)?
4. Is the risk of sensory deprivation-induced isolation identified?
5. Does the student propose at least two activities to promote social participation?`,

  'SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY': `NIC Advanced Safeguarding & Advocacy Standards — Rubric

CONTEXT: This module covers the caregiver advocacy role, professional boundaries under pressure, documentation and reporting responsibilities, managing caregiver stress and burnout, and maintaining professional resilience.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student articulates the caregiver as a client advocate — not a family agent or passive task executor. Demonstrates how to respectfully challenge unsafe instructions from family elders using evidence-based communication. Correctly describes documentation responsibilities (objective, contemporaneous, signed). Shows understanding of professional resilience strategies.
▸ GOOD (70–89%): Advocacy role understood. Documentation responsibilities correct. Challenging unsafe instructions addressed. Resilience strategies present.
▸ SATISFACTORY (50–69%): Advocacy acknowledged but applied passively. Documentation mentioned. Stress management surface-level.
▸ UNSATISFACTORY (0–49%): Caregiver role described as purely task-based or subordinate to family instructions. Documentation not addressed as a professional duty.

KEY COMPETENCIES TO ASSESS:
1. Does the student distinguish advocacy (acting in the client interest, even when difficult) from compliance (doing what they are told)?
2. Is the documentation standard described: objective language, time-stamped, factual, no personal opinions?
3. Can the student describe a communication strategy for respectfully challenging an unsafe family instruction?
4. Are at least two professional resilience/self-care strategies identified?
5. Does the student identify their duty to report concerns up the chain rather than resolve them alone?`,

  'DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT': `NIC Documentation, Self-Care & Career Development Standards — Rubric

CONTEXT: This module covers accurate care record keeping, the legal status of care documentation, professional self-care to prevent burnout, and NIC career pathway progression (Levels 1–5).

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates correct documentation standards (SOAP or equivalent: objective, factual, dated, signed). Articulates the legal weight of care records and risk of incomplete documentation. Proposes at least three specific self-care strategies (peer support, scheduled rest, boundary setting, debriefing, supervision). Maps their own NIC career pathway and articulates what advancement at the next level requires.
▸ GOOD (70–89%): Documentation standards correct. Legal risk of poor records mentioned. Self-care strategies identified. Career pathway awareness present.
▸ SATISFACTORY (50–69%): Documentation described but standards incomplete. Self-care surface-level. Career pathway vague.
▸ UNSATISFACTORY (0–49%): Documentation described as optional. Self-care not addressed as a professional responsibility.

KEY COMPETENCIES TO ASSESS:
1. Are documentation standards correct: objective language, factual observations only, date/time, signature, contemporaneous?
2. Does the student articulate why altering or omitting records is a serious professional and legal breach?
3. Are at least three specific (not generic) self-care strategies described?
4. Can the student name the NIC career levels (1–5) and describe what differentiates their current and next level?
5. Is CPD described as an ongoing professional obligation, not a one-time event?`
};

// ─── GENERATE SQL ─────────────────────────────────────────────────────────────
function escape(str) {
  return str.replace(/'/g, "''");
}

const lines = [
  '-- ============================================================',
  '-- NIC Grading Rubrics — Bulk Update',
  '-- Generated: ' + new Date().toISOString(),
  '-- Paste into Supabase SQL Editor and Run.',
  '-- ============================================================',
  ''
];

let count = 0;
for (const a of ASSESSMENTS) {
  const rubric = RUBRICS[a.module];
  if (!rubric) {
    lines.push(`-- WARNING: No rubric for module "${a.module}" (${a.id})`);
    continue;
  }
  lines.push(`-- ${a.module} | ${a.title}`);
  lines.push(`UPDATE assessments SET grading_rubric = '${escape(rubric)}' WHERE id = '${a.id}';`);
  lines.push('');
  count++;
}

lines.push('-- ============================================================');
lines.push(`-- Total updates: ${count}`);
lines.push('-- ============================================================');

const outPath = path.join('scratch', 'rubrics.sql');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Generated ${count} SQL UPDATE statements.`);
console.log(`File saved: ${outPath}`);
console.log(`File size: ${fs.statSync(outPath).size} bytes`);
