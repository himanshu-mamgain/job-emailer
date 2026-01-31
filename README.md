# Job Emailer CLI

A CLI tool to apply for jobs by sending emails with attached resumes.

## Features
- **Configurable Defaults**: Set your email service, credentials, and resume details once.
- **Easy Application**: Apply to jobs with a single command.
- **Smart Attachments**: Automatically attach your default resume or override it.
- **Debian Packaging**: Ready to be packaged as a `.deb` file for Linux.

## Installation

```bash
npm install
```

## Usage

### 1. Configuration (First Run)
Set up your email provider (Gmail/Outlook), credentials, and resume details.
```bash
npm start config
# or if installed globally/packaged:
job-emailer config
```

### 2. Apply for a Job
Send an email to a recruiter.
```bash
# Basic usage (uses default resume)
job-emailer apply recruiter@example.com "Software Engineer"

# With a specific cover letter file
job-emailer apply recruiter@example.com "Software Engineer" -c cover_letter.txt

# Override default resume
job-emailer apply recruiter@example.com "Software Engineer" -r ./specific_resume.pdf

# Skip attaching resume
job-emailer apply recruiter@example.com "Software Engineer" --no-resume
```

## Building .deb Package (Linux)

To create a Debian package for installation on Linux:

1. **Prepare the build directory** (Runs on Windows/Linux):
   ```bash
   npm run build:deb
   ```
2. **Build the package** (Requires `dpkg-deb`, run on Linux/WSL):
   ```bash
   dpkg-deb --build deb-build job-emailer_1.0.0_all.deb
   ```
3. **Install**:
   ```bash
   sudo dpkg -i job-emailer_1.0.0_all.deb
   ```
