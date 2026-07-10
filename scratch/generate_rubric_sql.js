/**
 * RUBRIC GENERATOR — Produces a SQL UPDATE file for Supabase
 * Run: node scratch/generate_rubric_sql.js > scratch/rubrics.sql
 * Then paste the SQL into the Supabase dashboard SQL editor.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync('.env.local','utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim();
const sb = createClient(url, key);

const RUBRICS = {
  "INTRODUCTION TO PROFESSIONAL CAREGIVING": `NIC Professional Caregiving Standards — Rubric

CONTEXT: This module establishes the transition from informal helper to NIC-certified professional caregiver. Responses are assessed on the student's understanding of professional identity, scope of practice, and the Nigerian home-care environment.

SCORING GUIDE (out of the assigned question marks):
▸ EXCELLENT (90–100%): Response clearly distinguishes the professional caregiver role from informal helping. Student demonstrates understanding of NIC's Code of Practice, articulates their scope of practice boundaries, and shows how cultural dynamics (family authority, traditional remedies, limited supervision) shape professional conduct in Nigeria. Uses correct terminology. Provides specific, contextualised examples.
▸ GOOD (70–89%): Response covers the key professional identity points with minor gaps. Shows understanding of scope of practice but may not fully address the Nigerian cultural context or boundary-setting scenarios. Examples present but less precise.
▸ SATISFACTORY (50–69%): Response covers basic concepts but lacks depth. May confuse caregiver scope with clinical roles, or address cultural context superficially. General statements without examples. Meets minimum standard.
▸ UNSATISFACTORY (0–49%): Response is vague, incorrect, or off-topic. Fails to define professional identity or scope. No engagement with Nigerian context. Critical safety understanding absent.

KEY COMPETENCIES TO ASSESS:
1. Can the student define the professional caregiver's role versus that of a family helper or clinical nurse?
2. Do they understand and articulate the NIC principle: "Know your role, know your limits, escalate when necessary"?
3. Can they identify at least two scenarios where professional boundaries apply in a Nigerian home?
4. Do they show awareness of continuous professional development (CPD) obligations?
5. Do they demonstrate an understanding of client-centred care as a professional standard?

AUTOMATIC FAIL TRIGGERS (regardless of score): Student suggests performing medical procedures (injections, IV, medication prescribing) as part of a caregiver's role without flagging this as outside scope.`,

  "ETHICS, DIGNITY AND PROFESSIONAL CONDUCT": `NIC Ethics & Dignity Standards — Rubric

CONTEXT: This module covers the ethical framework governing NIC-certified care: autonomy, beneficence, non-maleficence, justice, confidentiality, and dignity. Responses must reflect practical application in Nigerian home-care contexts where family dynamics and cultural norms often challenge these principles.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student names and correctly applies core ethical principles (autonomy, beneficence, non-maleficence, justice, dignity, confidentiality). Demonstrates clear understanding of professional boundaries, handles dual-role pressure (family vs. client) with nuance, and articulates how to uphold client dignity in resource-limited Nigerian settings. Shows capacity to resolve ethical dilemmas using a structured approach. References NIC Code of Practice.
▸ GOOD (70–89%): Core ethical principles covered with minor omissions. Good understanding of dignity and confidentiality. May lack depth on navigating family-led decision-making or cultural conflict. Ethical dilemma approach is sound but less structured.
▸ SATISFACTORY (50–69%): Basic ethical principles stated but not applied. Dignity discussed at surface level. Little engagement with Nigerian-specific ethical challenges. Formulaic responses.
▸ UNSATISFACTORY (0–49%): Incorrect or missing ethical principles. No meaningful discussion of dignity or confidentiality. Fails to engage with professional boundary scenarios.

KEY COMPETENCIES TO ASSESS:
1. Can the student correctly define and apply autonomy, beneficence, non-maleficence, and justice?
2. Do they articulate what client dignity looks like in personal care (privacy, choice, language, modesty)?
3. Can they explain how to maintain confidentiality when Nigerian family members demand information?
4. Do they demonstrate a step-by-step approach to ethical dilemmas (identify → gather facts → evaluate options → act → escalate)?
5. Do they show how cultural respect and professional ethics can coexist without compromising client safety?

AUTOMATIC FAIL TRIGGERS: Student indicates they would share client medical information with unauthorised family members, or that a family's instructions override patient safety.`,

  "COMMUNICATION & INTERPERSONAL SKILLS": `NIC Communication Standards — Rubric

CONTEXT: Effective communication is a core clinical safety skill. This module covers verbal, non-verbal, and written communication; structured reporting (SBAR, SOAP); family and interprofessional communication; and managing difficult conversations in Nigerian settings.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates command of active listening, non-verbal communication, and structured communication tools (SBAR/SOAP). Shows how to adapt communication for clients with disabilities, dementia, or language differences. Provides a clear, correct SBAR-style report in scenario questions. Demonstrates de-escalation strategies for conflict with families. Understands documentation as a communication tool.
▸ GOOD (70–89%): Communication principles sound. SBAR/SOAP attempted but may have gaps. Good on interpersonal skills; weaker on written documentation standards or disability-specific communication adaptations.
▸ SATISFACTORY (50–69%): Covers basic verbal communication. SBAR not used or used incorrectly. Limited awareness of non-verbal cues or communication adaptations for vulnerable clients.
▸ UNSATISFACTORY (0–49%): No evidence of structured communication skills. Responses focus on personal opinion rather than professional practice. No awareness of documentation as a clinical tool.

KEY COMPETENCIES TO ASSESS:
1. Does the student use SBAR or equivalent structured reporting in scenario responses?
2. Do they identify at least two communication adaptations for clients with cognitive or physical disabilities?
3. Can they explain the difference between subjective and objective documentation?
4. Do they demonstrate strategies for communicating professionally with authoritative Nigerian family members?
5. Do they show awareness of non-verbal cues as a clinical safety tool?`,

  "PERSONAL CARE & ACTIVITIES OF DAILY LIVING (ADLs)": `NIC ADL & Personal Care Standards — Rubric

CONTEXT: This module covers the safe, dignified provision of Activities of Daily Living (ADLs): bathing, grooming, dressing, oral hygiene, feeding assistance, toileting, and skin care. The emphasis is on promoting maximum client independence, upholding dignity at all times, and adapting techniques to resource-limited Nigerian home environments.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates step-by-step knowledge of at least three ADL procedures with correct safety and dignity considerations (gaining consent, ensuring privacy, encouraging participation, monitoring skin). Shows how to adapt procedures to limited resources (no running water, limited equipment). Demonstrates awareness of pressure injury prevention during positioning. Integrates cultural sensitivity into personal care.
▸ GOOD (70–89%): ADL procedures generally correct with minor safety omissions. Dignity principles present. Limited adaptation to Nigerian context or resource constraints.
▸ SATISFACTORY (50–69%): Basic ADL knowledge demonstrated but lacks procedural detail or dignity considerations. Safety points superficial. No contextual adaptation.
▸ UNSATISFACTORY (0–49%): Incorrect or unsafe ADL procedures. Dignity or privacy not mentioned. Missing understanding of the caregiver's role in maintaining independence.

KEY COMPETENCIES TO ASSESS:
1. Does the student include consent, privacy, and client participation as standard steps in any ADL?
2. Are safety considerations (fall prevention, skin integrity, aspiration risk) addressed in feeding/positioning responses?
3. Can they describe at least one adaptation for performing an ADL without running water or standard supplies?
4. Do they promote client independence (offering choices, assisting rather than doing for)?
5. Is accurate documentation of ADL observations included?`,

  "MOBILITY, TRANSFERS & POSITIONING": `NIC Safe Mobility & Positioning Standards — Rubric

CONTEXT: This module covers safe patient handling: bed mobility, transfer techniques, repositioning schedules, fall prevention, and emergency response to falls. Includes pressure injury staging and prevention.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly describes body mechanics for safe lifting/transfer, explains the 2-hourly repositioning rule for immobile patients, identifies pressure injury risk sites and prevention strategies. Demonstrates a structured fall-response protocol. Adapts techniques to environments without hoists or specialised equipment. Knows when to escalate.
▸ GOOD (70–89%): Safe transfer principles present, repositioning understood. May miss specific pressure injury stages or escalation trigger points. Limited adaptation to resource-limited settings.
▸ SATISFACTORY (50–69%): Basic awareness of safe moving. Repositioning mentioned but not scheduled. Pressure injuries recognised but prevention shallow. Fall response incomplete.
▸ UNSATISFACTORY (0–49%): Unsafe moving described (e.g., dragging patient, no assessment). No awareness of pressure injury prevention. No escalation plan for falls.

KEY COMPETENCIES TO ASSESS:
1. Does the student apply correct body mechanics principles (feet apart, back straight, pivot, no twisting)?
2. Is the 2-hourly repositioning schedule for immobile patients mentioned?
3. Are at least four pressure injury risk sites identified (sacrum, heels, hips, elbows)?
4. Is the correct post-fall response described (do not rush to move, assess LOC, call for help, document)?
5. Does the student adapt techniques to homes without hoists, slide sheets, or adjustable beds?`,

  "HEALTH, HYGIENE & INFECTION PREVENTION": `NIC Infection Control & Hygiene Standards — Rubric

CONTEXT: This module covers hand hygiene (WHO 5 Moments), PPE use and disposal, environmental cleaning, waste management, and infection control in resource-limited Nigerian homes (erratic water supply, limited PPE, shared spaces).

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly applies the WHO 5 Moments of Hand Hygiene and explains their clinical rationale. Correctly sequences donning and doffing of PPE. Explains appropriate waste segregation (clinical vs. general waste). Demonstrates creative, safe adaptation to resource-limited settings (waterless sanitiser, improvised barriers). Identifies cross-infection risks in shared Nigerian home environments and proposes mitigations.
▸ GOOD (70–89%): WHO moments and PPE use correct with minor gaps. Waste management understood. Limited adaptation to Nigerian resource constraints.
▸ SATISFACTORY (50–69%): Hand hygiene and PPE use covered at basic level. Waste management superficial. No Nigerian context adaptation.
▸ UNSATISFACTORY (0–49%): Incorrect or absent hand hygiene steps. PPE misused or doffing sequence wrong. No awareness of cross-infection risks.

KEY COMPETENCIES TO ASSESS:
1. Can the student name and justify the WHO 5 Moments of Hand Hygiene?
2. Is PPE donning/doffing sequence correct (gown → mask → goggles → gloves; reverse for doffing)?
3. Are clinical waste (sharps, soiled dressings) and general waste correctly differentiated?
4. Does the student propose at least one safe adaptation for infection control without running water?
5. Are high-touch surfaces and cross-contamination routes identified in a typical Nigerian home?`,

  "BASIC HEALTH SUPPORT & MEDICATION AWARENESS": `NIC Health Monitoring & Medication Awareness Standards — Rubric

CONTEXT: This module covers vital sign monitoring, medication awareness (not administration), recognising medication side effects, polypharmacy risks, and knowing when and how to escalate health concerns to clinical professionals.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies normal ranges for all five vital signs and can describe what deviations indicate. Articulates the caregiver's role in medication: reminder, observation of effect, and reporting — never administering without instruction or touching controlled drugs. Correctly identifies at least three red flags for escalation. Uses SBAR for escalation scenario. Demonstrates awareness of polypharmacy and drug-herb interactions in Nigeria.
▸ GOOD (70–89%): Vital sign ranges and medication role mostly correct. Escalation triggers identified but may miss specific thresholds. SBAR used but incomplete. Polypharmacy risk mentioned.
▸ SATISFACTORY (50–69%): Basic vital sign awareness. Medication role understood at surface level but lacks detail. Escalation triggers vague. No polypharmacy awareness.
▸ UNSATISFACTORY (0–49%): Incorrect vital sign ranges. Student suggests caregiver may prescribe, advise on dosage, or administer injections. No escalation awareness. Patient safety at risk.

KEY COMPETENCIES TO ASSESS:
1. Normal adult vital sign ranges: Temp 36.5–37.5°C | Pulse 60–100 bpm | RR 12–20 bpm | BP 90–140/60–90 mmHg | SpO2 95–100%
2. Does the student clearly state they do NOT prescribe, administer injections, or adjust dosages?
3. Are at least three specific clinical escalation triggers identified?
4. Is SBAR used for the escalation communication scenario?
5. Is the risk of combining traditional herbal remedies (Agbo) with prescription medications acknowledged?

AUTOMATIC FAIL TRIGGERS: Student suggests administering medication by injection, adjusting prescribed doses, or using herbal remedies as medication substitutes without medical oversight.`,

  "SAFETY, EMERGENCIES & INCIDENT REPORTING": `NIC Emergency Response & Incident Reporting Standards — Rubric

CONTEXT: This module covers recognition and first-line response to medical emergencies (stroke, hypoglycaemia, seizures, cardiac events, respiratory distress), fall management, incident documentation, and legal reporting obligations under Nigerian infrastructure constraints.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies the presenting signs of at least three emergencies and provides a safe, within-scope first-line response for each. Demonstrates awareness of the Nigerian context (delayed EMS, traffic, resource gaps). Correctly completes a simulated incident report (what, when, who, action taken, escalation). Articulates legal documentation obligations and the importance of objective, timely recording.
▸ GOOD (70–89%): Emergency recognition and response broadly correct with minor gaps. Incident report mostly complete. Nigerian context acknowledged. May miss specific legal reporting obligations or documentation timeline requirements.
▸ SATISFACTORY (50–69%): Recognises major emergencies (stroke, cardiac). Response may include unsafe actions. Incident report incomplete. Legal obligations not discussed.
▸ UNSATISFACTORY (0–49%): Incorrect or dangerous emergency response. No incident documentation skills. Scope of practice violated.

KEY COMPETENCIES TO ASSESS:
1. FAST acronym for stroke (Face drooping, Arm weakness, Speech difficulty, Time to call)?
2. Correct hypoglycaemia management: conscious → oral glucose; unconscious → do NOT give anything by mouth, escalate immediately?
3. Correct seizure response: protect from injury, do NOT restrain, do NOT put anything in mouth, time the seizure, escalate?
4. Does the incident report include: time/date, client name, what happened, witnesses, action taken, person notified?
5. Is the student's response to a fall correct: assess consciousness first, do not rush to lift?

AUTOMATIC FAIL TRIGGERS: Placing objects in mouth during seizure; giving food/drink to unconscious patient; moving a fallen patient without first assessing for injury.`,

  "SAFEGUARDING, ABUSE & RIGHTS PROTECTION": `NIC Safeguarding & Client Rights Standards — Rubric

CONTEXT: This module covers recognising, responding to, and reporting all forms of abuse and neglect. It covers client rights, whistleblowing, safeguarding cultures, and the unique challenges of reporting abuse within Nigerian family and community structures.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly identifies all major abuse types with Nigerian-specific examples. Demonstrates a clear reporting pathway: observe → document objectively → report to supervisor/NIC → do not promise secrecy to the client. Shows understanding of the caregiver's legal duty to report, even when the abuser is a family elder. Proposes practical strategies for building a safeguarding culture. Demonstrates client rights awareness (dignity, consent, advocacy).
▸ GOOD (70–89%): Major abuse types identified correctly. Reporting pathway clear. Legal duty acknowledged. Less depth on organisational abuse or safeguarding culture strategies. Nigerian-specific challenges partially addressed.
▸ SATISFACTORY (50–69%): Physical and emotional abuse recognised. Reporting pathway incomplete. Does not address legal duty or the challenge of reporting family members in Nigerian context.
▸ UNSATISFACTORY (0–49%): Abuse types confused or incomplete. Reporting absent or delayed. Student would keep information from supervisors. Client rights not addressed.

KEY COMPETENCIES TO ASSESS:
1. Are all six abuse types named: physical, emotional, sexual, financial, organisational, self-neglect?
2. Is the reporting pathway correct: do NOT investigate alone, do NOT promise secrecy, DO document objectively, DO report to supervisor?
3. Does the student demonstrate understanding that family members can be perpetrators?
4. Is the concept of whistleblowing protection understood?
5. Are at least three client rights articulated (dignity, consent, privacy, freedom from abuse, right to complain)?

AUTOMATIC FAIL TRIGGERS: Student says they would keep observed abuse private, handle it alone without reporting, or that cultural norms justify any form of client harm or neglect.`,

  "UNDERSTANDING DISABILITY AND INCLUSIVE CARE": `NIC Disability & Inclusive Care Standards — Rubric

CONTEXT: This module introduces the social model of disability, disability rights in Nigeria, inclusive care principles, and the ethical obligations of a caregiver working with persons with physical, intellectual, or sensory disabilities. Emphasis on empowerment over dependency.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly distinguishes the medical model (disability as problem to fix) from the social model (disability as context of barriers). Demonstrates understanding of disability rights as human rights. Shows how to deliver inclusive care that promotes autonomy and avoids paternalism. Identifies at least three environmental or attitudinal barriers to inclusion in Nigerian settings. Proposes adaptations to standard care that respect disability-specific needs. Uses empowerment language.
▸ GOOD (70–89%): Social vs. medical model distinguished. Rights framework mentioned. Inclusive care principles applied. May lack specificity on Nigerian barriers or empowerment strategies.
▸ SATISFACTORY (50–69%): Basic awareness of inclusive care. Disability treated primarily through the medical model. Rights language absent. Care described as "doing for" rather than "supporting to."
▸ UNSATISFACTORY (0–49%): Disability viewed only through a charitable or medical lens. No rights framework. Stereotyping or ableist assumptions present.

KEY COMPETENCIES TO ASSESS:
1. Does the student correctly explain the social model of disability?
2. Are disability rights framed as human rights, not charity?
3. Is person-first language used (person with a disability, not "the disabled one")?
4. Does the student identify at least two environmental barriers to inclusion that a caregiver can address?
5. Is client autonomy and self-determination central to the care approach described?`,

  "PERSON-CENTERED CARE FOR INDIVIDUALS WITH DISABILITIES": `NIC Person-Centred Care Standards (Disability) — Rubric

CONTEXT: This module focuses on developing individualised care plans for people with disabilities, working collaboratively with families and care teams, and ensuring the client's voice remains central to all care decisions.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates how to conduct a needs assessment, co-produce a care plan with the client, and review and adjust it over time. Shows understanding of the interdisciplinary team's roles (caregiver, nurse, therapist, social worker, family). Articulates how to handle family members who override the client's stated preferences. References NIC documentation standards for care plans. Proposes culturally appropriate adaptations.
▸ GOOD (70–89%): Care plan elements understood (goals, activities, review). Person-centred principles applied. Family collaboration described but client primacy may not be consistently maintained.
▸ SATISFACTORY (50–69%): Care plan concepts present but generic. Person-centred language used but not applied to specific scenarios. Family and team roles unclear.
▸ UNSATISFACTORY (0–49%): Care is described as caregiver-led or family-led with no client voice. No care plan elements. Team collaboration absent.

KEY COMPETENCIES TO ASSESS:
1. Does the care plan include: assessment, goals, specific activities, responsibilities, and review dates?
2. Is the client identified as the primary participant in care planning, not a passive recipient?
3. Does the student describe how to handle conflict between client preferences and family wishes?
4. Are at least two interdisciplinary team members identified and their roles described?
5. Is the care plan documented as a living, regularly reviewed document?`,

  "SUPPORTING PHYSICAL DISABILITIES AND MOBILITY CHALLENGES": `NIC Physical Disability Support Standards — Rubric

CONTEXT: This module covers safe support for clients with physical disabilities including hemiplegia, paraplegia, limb differences, and degenerative conditions. Topics include adaptive equipment, pressure injury prevention for wheelchair users, rehabilitation support, and preventing secondary complications.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates knowledge of adaptive equipment (wheelchair, hoists, grab rails, adaptive utensils) and when each applies. Correctly describes pressure injury prevention for wheelchair users (pressure relief every 15–30 mins). Shows awareness of secondary complication prevention (range-of-motion exercises, hydration for UTI prevention, compression for DVT risk). Adapts support to the Nigerian home context without specialist equipment.
▸ GOOD (70–89%): Adaptive equipment and pressure relief understood. Secondary complication prevention partially addressed. Nigerian adaptation partial. Physiotherapy collaboration mentioned.
▸ SATISFACTORY (50–69%): Basic physical disability support described. Pressure injury prevention superficial. Secondary complications not addressed.
▸ UNSATISFACTORY (0–49%): Unsafe support described. No awareness of secondary complications. Equipment misused or contraindicated techniques described.

KEY COMPETENCIES TO ASSESS:
1. Is pressure relief for wheelchair users described (15–30 minute intervals, weight shifts)?
2. Are at least two secondary complications of immobility identified (contractures, DVT, pressure injuries, UTI, pneumonia)?
3. Is range-of-motion (ROM) exercise differentiated from physiotherapy (caregiver supports, therapist prescribes)?
4. Does the student describe at least one adaptive equipment item correctly?
5. Is the importance of physiotherapy care plan compliance articulated?`,

  "INTELLECTUAL AND DEVELOPMENTAL DISABILITIES": `NIC Intellectual & Developmental Disability Support Standards — Rubric

CONTEXT: This module covers care for individuals with intellectual disabilities (ID), autism spectrum conditions (ASC), Down syndrome, and other developmental conditions. Focus: communication adaptations, positive behaviour support, daily skills support, and dignity and rights of adults with IDD.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates communication adaptations appropriate to IDD (simple sentences, visual aids, AAC symbols, consistent routines). Correctly describes positive behaviour support (PBS) principles — understanding the function of behaviour before responding. Shows de-escalation techniques and explicitly states physical restraint is a last resort requiring authorisation. Promotes daily skills development rather than dependency.
▸ GOOD (70–89%): Communication adaptations present and appropriate. PBS principles mentioned. De-escalation described. Restraint caution stated.
▸ SATISFACTORY (50–69%): Basic communication adjustments mentioned. Behaviour treated reactively rather than proactively. Restraint not explicitly addressed.
▸ UNSATISFACTORY (0–49%): Communication not adapted. Behaviour managed punitively. Restraint described as a routine response. Client treated as incapable of learning or decision-making.

KEY COMPETENCIES TO ASSESS:
1. Does the student name at least two appropriate communication adaptations for IDD (visual schedules, simplified language, AAC, consistent routines)?
2. Is behaviour understood as communication (student asks "what is the behaviour communicating?" before responding)?
3. Is physical restraint identified as a serious last resort requiring specific authorisation — never a first response?
4. Does the student describe at least one strategy for supporting daily living skill development?
5. Are the rights and capacity of adults with IDD respected?

AUTOMATIC FAIL TRIGGERS: Student describes physical restraint as a routine or first-line behaviour management strategy.`,

  "SENSORY DISABILITIES AND COMMUNICATION SUPPORT": `NIC Sensory Disability & Communication Standards — Rubric

CONTEXT: This module covers care for clients with visual, hearing, or combined sensory impairments. Topics include environmental orientation, safe guiding techniques, communication strategies for Deaf and hard-of-hearing clients, reducing isolation, and adapting daily care to sensory needs.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student correctly describes the sighted guide technique (client holds caregiver's arm, not the reverse). Demonstrates environmental orientation strategies for visually impaired clients (clock-face plate descriptions, consistent room layout, verbal narration). Shows communication adaptations for hearing-impaired clients (face client, speak clearly, use written notes). Identifies the risk of social isolation in sensory disability and proposes specific inclusion strategies.
▸ GOOD (70–89%): Sighted guide technique and hearing communication adaptations correct. Orientation strategies present. Isolation risk acknowledged.
▸ SATISFACTORY (50–69%): Basic awareness of visual and hearing disability. Sighted guide technique may be incorrect. Communication adaptations generic.
▸ UNSATISFACTORY (0–49%): Incorrect guiding technique (pulling or steering). No communication adaptations. Sensory disability treated as a cognitive impairment.

KEY COMPETENCIES TO ASSESS:
1. Is the correct sighted guide technique described (client holds caregiver's arm at elbow, caregiver walks half a step ahead)?
2. Are clock-face plate descriptions or verbal narration used for visually impaired clients during meals?
3. Are at least three communication strategies for hearing-impaired clients described (face client, reduce background noise, written communication, clear lip movement)?
4. Is the risk of sensory deprivation-induced isolation identified?
5. Does the student propose at least two activities or strategies to promote social participation?`,

  "SAFEGUARDING, ADVOCACY, AND PROFESSIONAL RESPONSIBILITY": `NIC Advanced Safeguarding & Advocacy Standards — Rubric

CONTEXT: This module covers the caregiver's advocacy role, professional boundaries under pressure, documentation and reporting responsibilities, managing caregiver stress and burnout, and maintaining professional resilience.

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student articulates the caregiver as a client advocate — not a family agent or passive task executor. Demonstrates how to respectfully challenge unsafe instructions from family elders using evidence-based communication. Correctly describes documentation responsibilities (objective, contemporaneous, signed). Shows understanding of professional resilience strategies and NIC's support pathways for caregiver stress.
▸ GOOD (70–89%): Advocacy role understood. Documentation responsibilities correct. Challenging unsafe instructions addressed. Resilience strategies present.
▸ SATISFACTORY (50–69%): Advocacy acknowledged but applied passively. Documentation mentioned. Stress management surface-level.
▸ UNSATISFACTORY (0–49%): Caregiver role described as purely task-based or subordinate to family instructions. Documentation not addressed as a professional duty.

KEY COMPETENCIES TO ASSESS:
1. Does the student distinguish advocacy (acting in the client's interest, even when difficult) from compliance (doing what they are told)?
2. Is the documentation standard described: objective language, time-stamped, factual, no personal opinions?
3. Can the student describe a communication strategy for respectfully challenging an unsafe family instruction?
4. Are at least two professional resilience / self-care strategies identified?
5. Does the student identify their duty to report concerns up the chain rather than resolve them alone?`,

  "DOCUMENTATION, SELF-CARE & CAREER DEVELOPMENT": `NIC Documentation, Self-Care & Career Development Standards — Rubric

CONTEXT: This module covers accurate care record keeping, the legal status of care documentation, professional self-care to prevent burnout, and NIC career pathway progression (Levels 1–5).

SCORING GUIDE:
▸ EXCELLENT (90–100%): Student demonstrates correct documentation standards (SOAP or equivalent: objective, factual, dated, signed). Articulates the legal weight of care records and the risk of incomplete documentation. Proposes at least three specific self-care strategies (peer support, scheduled rest, boundary setting, debriefing, supervision). Maps their own NIC career pathway and articulates what advancement at the next level requires.
▸ GOOD (70–89%): Documentation standards correct. Legal risk of poor records mentioned. Self-care strategies identified. Career pathway awareness present.
▸ SATISFACTORY (50–69%): Documentation described but standards incomplete. Self-care surface-level. Career pathway vague.
▸ UNSATISFACTORY (0–49%): Documentation described as optional or minimal. Self-care not addressed as a professional responsibility.

KEY COMPETENCIES TO ASSESS:
1. Are documentation standards correct: objective language, factual observations only, date/time, signature, contemporaneous?
2. Does the student articulate why altering or omitting records is a serious professional and legal breach?
3. Are at least three specific (not generic) self-care strategies described?
4. Can the student name the NIC career levels (1–5) and describe what differentiates their current and next level?
5. Is CPD described as an ongoing professional obligation, not a one-time event?`
};

async function main() {
    const { data: assessments, error } = await sb
        .from('assessments')
        .select(`id, title, grading_rubric, questions, lesson_id,
                 lessons!inner(module_id, modules!inner(title))`)
        .is('grading_rubric', null);

    if (error) { console.error('Fetch error:', error); process.exit(1); }

    const needsRubric = assessments.filter(a =>
        a.questions?.some(q => q.type === 'essay' || q.type === 'report')
    );

    const sqlLines = ['-- NIC Grading Rubrics — Auto-generated', '-- Run in Supabase SQL editor', ''];
    let matched = 0;
    let unmatched = 0;

    for (const a of needsRubric) {
        const moduleTitle = (a.lessons?.modules?.title || '').trim().toUpperCase();
        let rubric = null;
        for (const [key, val] of Object.entries(RUBRICS)) {
            if (moduleTitle.includes(key.toUpperCase())) {
                rubric = val.trim();
                matched++;
                break;
            }
        }
        if (!rubric) {
            unmatched++;
            sqlLines.push(`-- UNMATCHED: ${a.id} | ${moduleTitle} | ${a.title}`);
            continue;
        }
        // Escape single quotes for SQL
        const escapedRubric = rubric.replace(/'/g, "''");
        sqlLines.push(`UPDATE assessments SET grading_rubric = '${escapedRubric}' WHERE id = '${a.id}'; -- ${a.title}`);
    }

    const sqlOutput = path.join('scratch', 'rubrics.sql');
    fs.writeFileSync(sqlOutput, sqlLines.join('\n'));

    console.log(`Generated SQL for ${matched} assessments.`);
    if (unmatched > 0) console.log(`WARNING: ${unmatched} assessments had no matching rubric.`);
    console.log(`\nSQL file saved to: ${sqlOutput}`);
    console.log('Paste this file into the Supabase SQL Editor to apply all rubrics.');
}

main();
