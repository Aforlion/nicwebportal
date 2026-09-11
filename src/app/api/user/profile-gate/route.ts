import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      enrollmentId,
      gender,
      dob,
      stateOfOrigin,
      lga,
      educationLevel,
      entryCategory,
      priorIndustry,
      priorOccupation,
      preTrainingMonthlyIncome,
    } = body;

    if (!userId || !enrollmentId) {
      return NextResponse.json(
        { error: 'Missing userId or enrollmentId' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Update Profiles with Demographics
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        gender: gender || null,
        dob: dob || null,
        state_of_origin: stateOfOrigin || null,
        lga: lga || null,
        education_level: educationLevel || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // 2. Upsert Caregiver Career Pathway Origin
    const { error: pathwayError } = await supabase
      .from('caregiver_career_pathways')
      .upsert({
        user_id: userId,
        entry_category: entryCategory || 'FRESH_STARTER',
        prior_industry: priorIndustry || null,
        prior_occupation: priorOccupation || null,
        pre_training_monthly_income: preTrainingMonthlyIncome || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (pathwayError) {
      console.error('Career pathway error:', pathwayError);
    }

    // 3. Mark Enrollment Profile Gate as Completed
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        profile_gate_completed: true,
        gated_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);

    if (enrollmentError) {
      console.error('Enrollment gate update error:', enrollmentError);
      return NextResponse.json(
        { error: 'Failed to update enrollment gate status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile gate completed successfully. Certificate unlocked.',
    });
  } catch (error: any) {
    console.error('Profile gate error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
