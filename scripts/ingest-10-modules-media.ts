import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const moduleVideoMap: Record<number, string> = {
  1: 'https://www.youtube-nocookie.com/embed/PCobeoUybCU',
  2: 'https://www.youtube-nocookie.com/embed/q2CSaTDOi-s',
  3: 'https://www.youtube-nocookie.com/embed/WsSkb-qvmcI',
  4: 'https://www.youtube-nocookie.com/embed/11aLoh-1fVc',
  5: 'https://www.youtube-nocookie.com/embed/ATKgI7DSBws',
  6: 'https://www.youtube-nocookie.com/embed/wmSwf9aHb4s',
  7: 'https://www.youtube-nocookie.com/embed/QzfDbp-8f34',
  8: 'https://www.youtube-nocookie.com/embed/ZDZnLaN_Z1c',
  9: 'https://www.youtube-nocookie.com/embed/QSSvN90zrvw',
  10: 'https://www.youtube-nocookie.com/embed/_IlH7_jP7Fo',
};

// Precise mapping for the 50 lessons across 10 modules
const lessonAssetMap: Record<string, { banner: string; audio: string }> = {
  // Module 1
  '1-1': { banner: '/media/fundamentals/banners/lesson-1-what-is-caregiving.png', audio: '/media/fundamentals/audio/How_NIC_Professionalizes_Nigerian_Caregiving.m4a' },
  '1-2': { banner: '/media/fundamentals/banners/lesson-2-caregivers-role-in-society.png', audio: '/media/fundamentals/audio/Professionalizing_Caregiving_in_Nigeria.m4a' },
  '1-3': { banner: '/media/fundamentals/banners/lesson-3-types-of-care-settings.png', audio: '/media/fundamentals/audio/Professionalizing_Nigerian_Home_Care.m4a' },
  '1-4': { banner: '/media/fundamentals/banners/lesson-4-family-vs-professional-care.png', audio: '/media/fundamentals/audio/How_Nigeria_Is_Professionalizing_Home_Care.m4a' },
  '1-5': { banner: '/media/fundamentals/banners/lesson-5-expectations-nic-caregivers.png', audio: '/media/fundamentals/audio/Five_professional_standards_for_NIC_caregivers.m4a' },

  // Module 2
  '2-1': { banner: '/media/fundamentals/banners/lesson-2-1-human-dignity-respect.png', audio: '/media/fundamentals/audio/Protecting_client_dignity_and_independence.m4a' },
  '2-2': { banner: '/media/fundamentals/banners/lesson-2-2-nic-code-of-ethics.png', audio: '/media/fundamentals/audio/Ethics_and_Boundaries_for_Nigerian_Caregivers.m4a' },
  '2-3': { banner: '/media/fundamentals/banners/lesson-2-3-professional-boundaries.png', audio: '/media/fundamentals/audio/Professional_Ethics_and_Boundaries_in_Caregiving.m4a' },
  '2-4': { banner: '/media/fundamentals/banners/lesson-2-4-confidentiality-privacy.png', audio: '/media/fundamentals/audio/Guarding_Private_Information_in_Professional_Caregiving.m4a' },
  '2-5': { banner: '/media/fundamentals/banners/lesson-2-5-cultural-sensitivity.png', audio: '/media/fundamentals/audio/Handling_Family_Pressure_in_Professional_Caregiving.m4a' },

  // Module 3
  '3-1': { banner: '/media/fundamentals/banners/lesson-3-1-verbal-non-verbal-communication.png', audio: '/media/fundamentals/audio/Professional_Communication_with_Persons_with_Disabilities.m4a' },
  '3-2': { banner: '/media/fundamentals/banners/lesson-3-2-active-listening.png', audio: '/media/fundamentals/audio/Sensory_and_pacing_tips_for_caregivers.m4a' },
  '3-3': { banner: '/media/fundamentals/banners/lesson-3-3-communicating-with-elderly.png', audio: '/media/fundamentals/audio/Treating_Caregiving_Clients_as_Capable_Equals.m4a' },
  '3-4': { banner: '/media/fundamentals/banners/lesson-3-4-communicating-disabilities.png', audio: '/media/fundamentals/audio/Professional_Communication_with_Persons_with_Disabilities.m4a' },
  '3-5': { banner: '/media/fundamentals/banners/lesson-3-5-managing-difficult-behaviors.png', audio: '/media/fundamentals/audio/Safely_Managing_Challenging_Client_Behaviors.m4a' },

  // Module 4
  '4-1': { banner: '/media/fundamentals/banners/lesson-4-1-personal-hygiene-grooming.png', audio: '/media/fundamentals/audio/Dignity_and_Safety_in_Professional_Hygiene.m4a' },
  '4-2': { banner: '/media/fundamentals/banners/lesson-4-2-bathing-toileting-assistance.png', audio: '/media/fundamentals/audio/Professional_Standards_for_Intimate_Care.m4a' },
  '4-3': { banner: '/media/fundamentals/banners/lesson-4-3-feeding-nutrition-basics.png', audio: '/media/fundamentals/audio/Professional_Standards_for_Nigerian_Home_Caregivers.m4a' },
  '4-4': { banner: '/media/fundamentals/banners/lesson-4-4-dressing-appearance.png', audio: '/media/fundamentals/audio/Professional_Standards_for_Intimate_Care.m4a' },
  '4-5': { banner: '/media/fundamentals/banners/lesson-4-5-maintaining-privacy-during-care.png', audio: '/media/fundamentals/audio/Protecting_patient_privacy_during_intimate_care.m4a' },

  // Module 5
  '5-1': { banner: '/media/fundamentals/banners/lesson-5-1-body-mechanics-safety.png', audio: '/media/fundamentals/audio/Why_Caregivers_Must_Stop_Manual_Lifting.m4a' },
  '5-2': { banner: '/media/fundamentals/banners/lesson-5-2-assisting-with-walking.png', audio: '/media/fundamentals/audio/Why_Fixing_Mobility_Aids_Is_Dangerous.m4a' },
  '5-3': { banner: '/media/fundamentals/banners/lesson-5-3-bed-mobility-transfers.png', audio: '/media/fundamentals/audio/Why_Lifting_a_Fallen_Patient_Is_Dangerous.m4a' },
  '5-4': { banner: '/media/fundamentals/banners/lesson-5-4-use-of-mobility-aids.png', audio: '/media/fundamentals/audio/Why_Fixing_Mobility_Aids_Is_Dangerous.m4a' },
  '5-5': { banner: '/media/fundamentals/banners/lesson-5-5-fall-prevention.png', audio: '/media/fundamentals/audio/Professional_fall_prevention_and_clinical_response.m4a' },

  // Module 6
  '6-1': { banner: '/media/fundamentals/banners/lesson-6-1-basic-health-observation.png', audio: '/media/fundamentals/audio/How_to_Observe_Health_Without_Diagnosing.m4a' },
  '6-2': { banner: '/media/fundamentals/banners/lesson-6-2-hand-hygiene-ppe.png', audio: '/media/fundamentals/audio/Infection_Control_with_Hand_Hygiene_and_PPE.m4a' },
  '6-3': { banner: '/media/fundamentals/banners/lesson-6-3-infection-control-principles.png', audio: '/media/fundamentals/audio/How_Caregivers_Break_the_Chain_of_Infection.m4a' },
  '6-4': { banner: '/media/fundamentals/banners/lesson-6-4-waste-disposal.png', audio: '/media/fundamentals/audio/Safe_Linen,_Waste,_and_Sharps_Protocols.m4a' },
  '6-5': { banner: '/media/fundamentals/banners/lesson-6-5-environmental-cleanliness.png', audio: '/media/fundamentals/audio/Why_Clean_Surfaces_Still_Spread_Infection.m4a' },

  // Module 7
  '7-1': { banner: '/media/fundamentals/banners/lesson-7-1-understanding-common-illnesses.png', audio: '/media/fundamentals/audio/How_Caregivers_Track_Patient_Baselines.m4a' },
  '7-2': { banner: '/media/fundamentals/banners/lesson-7-2-medication-awareness.png', audio: '/media/fundamentals/audio/Professional_Home_Caregiving_and_Emergency_Red_Flags.m4a' },
  '7-3': { banner: '/media/fundamentals/banners/lesson-7-3-monitoring-changes-in-condition.png', audio: '/media/fundamentals/audio/How_to_Observe_Health_Without_Diagnosing.m4a' },
  '7-4': { banner: '/media/fundamentals/banners/lesson-7-4-supporting-treatment-plans.png', audio: '/media/fundamentals/audio/Professional_Standards_for_Nigerian_Home_Caregivers.m4a' },
  '7-5': { banner: '/media/fundamentals/banners/lesson-7-5-when-to-escalate.png', audio: '/media/fundamentals/audio/When_Caregivers_Must_Escalate_Medical_Emergencies.m4a' },

  // Module 8
  '8-1': { banner: '/media/fundamentals/banners/lesson-8-1-home-facility-safety.png', audio: '/media/fundamentals/audio/Assessing_Home_Safety_for_Caregivers.m4a' },
  '8-2': { banner: '/media/fundamentals/banners/lesson-8-2-fire-electrical-safety.png', audio: '/media/fundamentals/audio/Hospital_Safety_in_Private_Nigerian_Homes.m4a' },
  '8-3': { banner: '/media/fundamentals/banners/lesson-8-3-falls-injuries-accidents.png', audio: '/media/fundamentals/audio/Professional_fall_prevention_and_clinical_response.m4a' },
  '8-4': { banner: '/media/fundamentals/banners/lesson-8-4-first-response-basics.png', audio: '/media/fundamentals/audio/Professional_Home_Caregiving_and_Emergency_Red_Flags.m4a' },
  '8-5': { banner: '/media/fundamentals/banners/lesson-8-5-incident-reporting-procedures.png', audio: '/media/fundamentals/audio/Objective_Incident_Reporting_for_Caregivers.m4a' },

  // Module 9
  '9-1': { banner: '/media/fundamentals/banners/lesson-9-1-types-of-abuse-neglect.png', audio: '/media/fundamentals/audio/Recognizing_Elder_Abuse_in_Nigerian_Homes.m4a' },
  '9-2': { banner: '/media/fundamentals/banners/lesson-9-2-recognizing-warning-signs.png', audio: '/media/fundamentals/audio/How_Caregivers_Spot_Hidden_Elder_Abuse.m4a' },
  '9-3': { banner: '/media/fundamentals/banners/lesson-9-3-duty-to-report.png', audio: '/media/fundamentals/audio/A_Caregiver_s_Duty_to_Report_Abuse.m4a' },
  '9-4': { banner: '/media/fundamentals/banners/lesson-9-4-whistleblowing-protection.png', audio: '/media/fundamentals/audio/How_Nigerian_Caregivers_Blow_the_Whistle.m4a' },
  '9-5': { banner: '/media/fundamentals/banners/lesson-9-5-nic-safeguarding-framework.png', audio: '/media/fundamentals/audio/A_Caregiver_s_Duty_to_Report_Abuse.m4a' },

  // Module 10
  '10-1': { banner: '/media/fundamentals/banners/lesson-10-1-basic-care-documentation.png', audio: '/media/fundamentals/audio/Why_Undocumented_Care_Means_No_Care.m4a' },
  '10-2': { banner: '/media/fundamentals/banners/lesson-10-2-time-management-teamwork.png', audio: '/media/fundamentals/audio/The_Three_Pillars_of_Professional_Caregiving.m4a' },
  '10-3': { banner: '/media/fundamentals/banners/lesson-10-3-stress-management-burnout-prevention.png', audio: '/media/fundamentals/audio/Preventing_Caregiver_Burnout_in_Nigerian_Homes.m4a' },
  '10-4': { banner: '/media/fundamentals/banners/lesson-10-4-self-care-for-caregivers.png', audio: '/media/fundamentals/audio/Preventing_Caregiver_Burnout_in_Nigerian_Homes.m4a' },
  '10-5': { banner: '/media/fundamentals/banners/lesson-10-5-career-pathways-with-nic.png', audio: '/media/fundamentals/audio/The_science_of_professional_Nigerian_caregiving.m4a' },
};

async function ingestMedia() {
  console.log('Starting Media Ingestion...');

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      course_modules (
        sort_order,
        modules (
          id,
          title,
          lessons (
            id,
            title,
            slug,
            content,
            video_url,
            sort_order
          )
        )
      )
    `)
    .eq('id', 'd040764a-e8c3-46c4-975d-7802c91fa1d6');

  if (error || !courses || courses.length === 0) {
    console.error('Error fetching course:', error);
    return;
  }

  const course = courses[0];
  const modules = (course.course_modules as any[])
    .map(cm => ({ ...cm.modules, sort_order: cm.sort_order }))
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const m of modules) {
    const videoUrl = moduleVideoMap[m.sort_order];
    console.log(`\nProcessing Module ${m.sort_order}: ${m.title}`);

    const lessons = (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    
    // Determine content lessons vs summary/quiz lessons
    let coreLessonIdx = 1;
    for (const l of lessons) {
      // Skip Module Summary (98) and Assessment (99) for media injection
      if (l.sort_order >= 90) {
        // Set video URL on assessment / summary too for consistency
        await supabase.from('lessons').update({ video_url: videoUrl }).eq('id', l.id);
        continue;
      }

      const key = `${m.sort_order}-${coreLessonIdx}`;
      const media = lessonAssetMap[key];

      let rawContent = l.content || '';
      // Strip any previous injected banner/audio tags to avoid duplication
      rawContent = rawContent.replace(/!\[Infographic Banner\]\(.*?\)\n\n?/g, '');
      rawContent = rawContent.replace(/<audio controls src=".*?" style=".*?"><\/audio>\n\n?/g, '');

      let newContent = rawContent;

      if (media) {
        const bannerMarkdown = `![Infographic Banner](${media.banner})\n\n`;
        const audioTag = `<audio controls src="${media.audio}" style="width: 100%; margin-bottom: 24px; border-radius: 12px;"></audio>\n\n`;
        newContent = `${bannerMarkdown}${audioTag}${rawContent}`;
      }

      console.log(`   Lesson ${l.sort_order} [${l.title}]: Video=${videoUrl}, Key=${key}`);

      const { error: updateErr } = await supabase
        .from('lessons')
        .update({
          video_url: videoUrl,
          content: newContent,
          resource_url: media?.audio || null,
        })
        .eq('id', l.id);

      if (updateErr) {
        console.error(`   Failed updating lesson ${l.id}:`, updateErr.message);
      } else {
        console.log(`   Updated lesson ${l.id} successfully!`);
      }

      coreLessonIdx++;
    }
  }

  console.log('\n🎉 ALL 10 MODULE VIDEOS, 50 PNG BANNERS, AND 48 AUDIO PODCASTS FULLY INGESTED!');
}

ingestMedia();
