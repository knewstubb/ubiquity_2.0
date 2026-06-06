# Creating a Connection

Before you can import or export data, you need to create a connection. A connection tells UbiQuity where your files live and how to access them securely.

## What you'll need

Have these details ready before you start. Your IT team or hosting provider can give you these if you're unsure.

### For AWS S3

- AWS region (e.g. us-east-1, ap-southeast-2)
- Bucket name
- Optional: a prefix (subfolder path within the bucket)
- Authentication — either:
  - An Access Key ID and Secret Access Key, or
  - An AWS Account ID and IAM Role ARN

### For Azure Blob

- Container name
- Account name
- A SAS (Shared Access Signature) token

### For SFTP

- Hostname (server address)
- Port number (usually 22)
- Username
- Optional: a public SSH key

### For all connection types

- A name for the connection (something you'll recognise, like "Production S3" or "Marketing SFTP")
- An optional base path (the root folder UbiQuity should use)
- At least one email address for alerts (in case the connection goes down)

---

## Step-by-step

### 1. Open the Connectors page

Go to **Audience > Integrations** from the top navigation.

### 2. Start creating

Click the **+ New Connection** button in the top-right corner of the page.

### 3. Choose your connection type

You'll see three options:

- **AWS S3**
- **Azure Blob**
- **SFTP**

Click the card that matches your file storage, then click **Next**.

### 4. Fill in the general details

At the top of the form, fill in:

- **Connection Name** — a friendly name so you can identify this connection later.
- **Base Path** — the root folder on your server where UbiQuity should look for files. Leave blank if you want to set paths per-automation later.
- **Alert Email(s)** — who should be notified if this connection stops working. Your email is pre-filled. You can add more by typing an address and pressing Enter.

### 5. Fill in the connection settings

These fields depend on your connection type:

**AWS S3:**
- Select your AWS Region from the dropdown.
- Enter your Bucket Name.
- Optionally add a Prefix if your files are in a subfolder within the bucket.

**Azure Blob:**
- Enter your Container Name.
- Enter your Account Name.

**SFTP:**
- Enter the Hostname (your server address).
- Enter the Port (defaults to 22 — most people won't need to change this).

### 6. Fill in the authentication details

This section has a grey background to visually separate it from the connection settings above.

**AWS S3:**
- Choose your authentication method: **Access Key** or **IAM Role**.
- If Access Key: enter your Access Key ID and Secret Access Key.
- If IAM Role: enter your AWS Account ID and IAM Role ARN.

**Azure Blob:**
- Enter your SAS Token.

**SFTP:**
- Enter your Username.
- Optionally paste your Public SSH Key.

### 7. Test the connection

At the bottom of the authentication section, click **Test Connection**. UbiQuity will attempt to reach your server with the credentials you've provided.

- If successful, you'll see a green checkmark and "Connection verified".
- If it fails, double-check your credentials and try again.

> **Note:** You must pass the connection test before you can create the connection.

### 8. Create the connection

Once the test passes, click **Create Connection**. Your new connection appears on the Connectors page, ready for automations.

---

## Editing a connection

To change connection details later:

1. Find the connection on the Connectors page.
2. Click the three-dot menu (⋯) on the connection row.
3. Select **Edit Connection**.
4. You'll see a warning that changes may affect linked automations. Click **Continue**.
5. Make your changes. If you changed credentials or server details, you'll need to re-test the connection.
6. Click **Update Connection**.

> **Important:** You cannot change the connection type (e.g. from SFTP to AWS S3) after creation. If you need a different type, create a new connection.

---

## Tips

- **Use descriptive names.** If you have multiple S3 buckets, name them by purpose (e.g. "CRM Daily Exports" rather than just "S3").
- **Add multiple alert emails.** If the person responsible is on holiday, someone else will still get notified.
- **Set a base path** if all your automations will read from the same root folder. This saves you entering the full path on every automation.
