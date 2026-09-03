async function getHeaders() {
  try {
    const res = await fetch('https://fyaeabdaxqrdosdksqwx.supabase.co')
    console.log('Headers:')
    res.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
  } catch (err: any) {
    console.error('Error:', err.message)
  }
}

getHeaders()
