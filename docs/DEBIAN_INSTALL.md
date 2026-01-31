# Installing Job Emailer via Debian Repository

You can install `job-emailer` directly from our generic Debian repository (hosted on GitHub or elsewhere) to receive automatic updates.

## Prerequisites

- A Debian-based Linux distribution (Ubuntu, Debian, Pop!_OS, etc.)
- `curl` and `gpg` installed.

## Installation Steps

### 1. Add the Repository GPG Key

Trust the repository signing key:

```bash
curl -fsSL [DEB_REPO_URL]/KEY.gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/job-emailer.gpg
```

### 2. Add the Repository to Sources

Add the repository URL to your APT sources list:

```bash
echo "deb [arch=all] [DEB_REPO_URL] /" | sudo tee /etc/apt/sources.list.d/job-emailer.list
```

> **Note:** Replace `[DEB_REPO_URL]` with the actual URL provided by the repository host (e.g., `https://username.github.io/job-emailer-repo`).

### 3. Install the Package

Update your package list and install:

```bash
sudo apt update
sudo apt install job-emailer
```

## Uninstalling

To remove the package:

```bash
sudo apt remove job-emailer
```

To remove the repository configuration:

```bash
sudo rm /etc/apt/sources.list.d/job-emailer.list
sudo rm /etc/apt/trusted.gpg.d/job-emailer.gpg
```
