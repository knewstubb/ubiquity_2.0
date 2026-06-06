# Connectors

Connectors are how you move data in and out of UbiQuity automatically. Instead of uploading files manually, you set up a connection to your file storage (like AWS S3 or an SFTP server), then create automations that run on a schedule — importing fresh data or exporting segments for use in other systems.

## Key concepts

### Connections

A connection is the link between UbiQuity and your file storage. It stores the credentials and server details needed to access your files. Think of it as a bridge — once it's set up, you can run as many automations across it as you need.

UbiQuity supports three connection types:

- **AWS S3** — Amazon's cloud storage. Good for teams already using AWS.
- **Azure Blob** — Microsoft's cloud storage. Good for teams on the Microsoft stack.
- **SFTP** — A secure file transfer server. Works with most hosting providers.

### Automations

An automation is a task that runs on a connection. There are two types:

- **Importers** bring data into UbiQuity. For example, importing a daily file of new customer contacts from your CRM.
- **Exporters** send data out of UbiQuity. For example, exporting a segment of high-value customers to a file your ad platform can pick up.

Each automation has its own name, configuration, and schedule. You can have multiple automations running on a single connection.

### Schedules

Automations run on a schedule you define. You choose the frequency (hourly, daily, weekly, or monthly) and UbiQuity handles the rest. You can also pause and resume automations at any time.

## How it all fits together

1. **Create a connection** — provide your storage credentials and test that UbiQuity can reach your server.
2. **Add an automation** — choose import or export, configure what data to move and how to handle it.
3. **Let it run** — UbiQuity processes files automatically on your schedule. You get email notifications if anything goes wrong.

## Where to find Connectors

Connectors lives under the **Audience** section. Click **Audience** in the top navigation, then select **Integrations** from the dropdown menu.

## What's next

- [Creating a connection](./creating-a-connection.md) — set up your first connection
- [Creating an importer](./creating-an-importer.md) — bring data into UbiQuity
- [Creating an exporter](./creating-an-exporter.md) — send data out of UbiQuity
- [Managing automations](./managing-automations.md) — pause, resume, edit, and monitor
- [Troubleshooting](./troubleshooting.md) — fix common issues
