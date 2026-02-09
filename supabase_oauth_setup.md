# Supabase Google OAuth Configuration Guide

To complete the Google OAuth setup, you need to configure settings in both the **Google Cloud Console** and the **Supabase Dashboard**.

## 1. Google Cloud Console Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Navigate to **APIs & Services** > **OAuth consent screen**.
    *   Choose **External** user type.
    *   Fill in the required App Information (App name, User support email, Developer contact info).
4.  Navigate to **APIs & Services** > **Credentials**.
    *   Click **Create Credentials** > **OAuth client ID**.
    *   Select **Web application** as the Application type.
    *   **Name**: `NIC Portal (Prod)` or `NIC Portal (Local)`.
    *   **Authorized JavaScript origins**:
        *   `http://localhost:3000` (for local development)
        *   `https://your-production-domain.com`
    *   **Authorized redirect URIs**:
        *   `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
        *   *(You can find your Project Ref in the Supabase Dashboard URL)*
5.  Copy the **Client ID** and **Client Secret**.

## 2. Supabase Dashboard Configuration

1.  Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2.  Go to **Authentication** > **Providers**.
3.  Find **Google** in the list and expand it.
4.  **Enable Google**: Toggle to ON.
5.  **Client ID**: Paste the Client ID from Google Cloud Console.
6.  **Client Secret**: Paste the Client Secret from Google Cloud Console.
7.  Click **Save**.

## 3. Auth Redirect Settings

1.  In the Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2.  **Site URL**:
    *   Set to `http://localhost:3000` for now, or your production URL if you are ready to deploy.
3.  **Redirect URLs**:
    *   Add `http://localhost:3000/**`
    *   Add `https://your-production-domain.com/**`
    *   Add `http://localhost:3000/auth/callback`

---

### Verification
Once these steps are done, the **"Google Account"** button on your login and signup pages will correctly trigger the Google sign-in flow and return the user to the portal.
