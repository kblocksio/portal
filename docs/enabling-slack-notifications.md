# Enabling Slack Notifications

This guide explains how to create a Slack token and use it to allow Kblocks to send messages to Slack.

## 1. Create a Slack App

1. Visit the [Slack API page](https://api.slack.com/).
2. Click **"Create an App"**.
3. Choose **"From Scratch"** and provide a name for your app and select the Slack workspace.

## 2. Set Scopes and Permissions

1. Go to the **OAuth & Permissions** section in the left-hand menu.
2. In the **Scopes** section, add the following **Bot Token Scopes**:
   - `chat:write` (to send messages to channels)

## 3. Install the App to Your Workspace

1. Still in the **OAuth & Permissions** section, scroll up to **OAuth Tokens for Your Workspace**.
2. Click **Install App to Workspace**.
3. Review and allow the permissions.
4. After installation, you'll see a **Bot User OAuth Token** (starts with `xoxb-`). Copy this token.

## 4. Add Your App to a Channel

1. Go to the Slack workspace where your app is installed.
2. Invite the app to the desired channel using:
   ```
   /invite @YourAppName
   ```

## 5. Use the token when deploying the Kblocks backend

Set the token in the `SLACK_API_TOKEN` and `SLACK_CHANNEL` environment variables in the `secrets/portal.env` file.
