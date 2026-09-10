const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function auditMembershipAndCompletion() {
  console.log("=== COMPREHENSIVE MEMBERSHIP & COURSE COMPLETION AUDIT ===");

  // 1. Total Profiles
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at');

  if (pErr) {
    console.error("Error fetching profiles:", pErr);
    return;
  }

  const totalProfiles = profiles.length;
  console.log(`Total User Profiles in Database: ${totalProfiles}`);

  // Group profiles by role
  const roleCounts = {};
  profiles.forEach(p => {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  });
  console.log('Profiles by Role:', roleCounts);

  // 2. Memberships
  const { data: memberships, error: mErr } = await supabase
    .from('memberships')
    .select('id, user_id, nic_id, category, status, is_active');

  if (mErr) console.error("Error fetching memberships:", mErr);
  console.log(`Total Membership Records: ${memberships?.length || 0}`);

  // 3. Enrollments
  const { data: enrollments, error: eErr } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, status, progress, enrolled_at, completed_at, courses(title)');

  if (eErr) console.error("Error fetching enrollments:", eErr);
  
  const totalEnrollments = enrollments?.length || 0;
  console.log(`Total Course Enrollments: ${totalEnrollments}`);

  // Set of user IDs with at least 1 course enrollment
  const enrolledUserIds = new Set(enrollments.map(e => e.user_id));

  // Count how many users have 0 enrollments
  // Filter for students/members (or all users)
  const usersWithNoCourse = profiles.filter(p => !enrolledUserIds.has(p.id));
  const usersWithCourse = profiles.filter(p => enrolledUserIds.has(p.id));

  const studentsMembersNoCourse = profiles.filter(p => (p.role === 'student' || p.role === 'member') && !enrolledUserIds.has(p.id));
  const studentsMembersWithCourse = profiles.filter(p => (p.role === 'student' || p.role === 'member') && enrolledUserIds.has(p.id));

  console.log(`\n=== MEMBER COURSE PARTICIPATION BREAKDOWN ===`);
  console.log(`- Total Students & Individual Members: ${roleCounts['student'] || 0 + roleCounts['member'] || 0}`);
  console.log(`- Registered WITH at least 1 Course Enrollment: ${studentsMembersWithCourse.length}`);
  console.log(`- Registered WITHOUT taking any course (0 enrollments): ${studentsMembersNoCourse.length}`);
  console.log(`- Percentage of Members with NO Course: ${((studentsMembersNoCourse.length / (studentsMembersWithCourse.length + studentsMembersNoCourse.length || 1)) * 100).toFixed(1)}%`);

  // 4. Course Completion Analysis
  const completedEnrollments = enrollments.filter(e => e.status === 'completed' || Number(e.progress) === 100);
  const activeOrInProgressEnrollments = enrollments.filter(e => e.status !== 'completed' && Number(e.progress) < 100);

  const overallCompletionRate = totalEnrollments > 0 ? (completedEnrollments.length / totalEnrollments) * 100 : 0;

  console.log(`\n=== COURSE COMPLETION METRICS ===`);
  console.log(`- Total Enrollments Across All Courses: ${totalEnrollments}`);
  console.log(`- Completed Enrollments (100% Progress / Completed): ${completedEnrollments.length}`);
  console.log(`- In-Progress / Pending Enrollments: ${activeOrInProgressEnrollments.length}`);
  console.log(`- Overall Course Completion Rate: ${overallCompletionRate.toFixed(1)}%`);

  // 5. Per-Course Breakdown
  const courseStats = {};
  enrollments.forEach(e => {
    const courseTitle = e.courses?.title || `Course ID: ${e.course_id}`;
    if (!courseStats[courseTitle]) {
      courseStats[courseTitle] = { total: 0, completed: 0, inProgress: 0 };
    }
    courseStats[courseTitle].total += 1;
    if (e.status === 'completed' || Number(e.progress) === 100) {
      courseStats[courseTitle].completed += 1;
    } else {
      courseStats[courseTitle].inProgress += 1;
    }
  });

  console.log(`\n=== PER-COURSE COMPLETION BREAKDOWN ===`);
  const courseBreakdownTable = Object.keys(courseStats).map(title => {
    const stat = courseStats[title];
    const rate = stat.total > 0 ? ((stat.completed / stat.total) * 100).toFixed(1) + '%' : '0%';
    return {
      course: title,
      enrolled: stat.total,
      completed: stat.completed,
      inProgress: stat.inProgress,
      completionRate: rate
    };
  });
  console.log(JSON.stringify(courseBreakdownTable, null, 2));

  // 6. Output Summary Object for output formatting
  const summary = {
    totalUsers: totalProfiles,
    studentsCount: roleCounts['student'] || 0,
    membersCount: roleCounts['member'] || 0,
    facilityAdminsCount: roleCounts['facility_admin'] || 0,
    superAdminsCount: roleCounts['super_admin'] || 0,
    registeredNoCourseTotal: usersWithNoCourse.length,
    registeredNoCourseStudentsMembers: studentsMembersNoCourse.length,
    registeredWithCourseStudentsMembers: studentsMembersWithCourse.length,
    totalEnrollments,
    completedEnrollments: completedEnrollments.length,
    inProgressEnrollments: activeOrInProgressEnrollments.length,
    overallCompletionRate: overallCompletionRate.toFixed(1) + '%',
    courseBreakdown: courseBreakdownTable
  };

  console.log("\n=== FINAL AUDIT SUMMARY JSON ===");
  console.log(JSON.stringify(summary, null, 2));
}

auditMembershipAndCompletion().catch(console.error);
