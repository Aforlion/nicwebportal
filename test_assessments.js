const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
        id,
        course_modules (
            modules (
                id,
                lessons (
                    id,
                    title,
                    assessments (
                        id,
                        title
                    )
                )
            )
        )
    `)
    .eq("id", "d040764a-e8c3-46c4-975d-7802c91fa1d6")
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const moduleLessons = course.course_modules[0]?.modules?.lessons;
  const assessmentLesson = moduleLessons?.find((l) => l.title.includes("ASSESSMENT"));
  console.log("Assessment lesson:", JSON.stringify(assessmentLesson, null, 2));
}

check();
