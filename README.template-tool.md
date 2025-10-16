# Baukasten Template Maintenance (template-tool branch)

This README is for **template maintainers**. It documents how to manage child repositories, propagate template updates, and handle semantic versioning for the Baukasten template.

---

## 1. Update Child Repositories Workflow

### Workflow: `.github/workflows/update-child-repos.yml`

- **Purpose:** Automates updating all child repositories with the latest changes from the template.
- **How it works:**
  - Triggered manually via GitHub Actions (workflow_dispatch).
  - Clones each child repository listed in `.github/child-repositories.json`.
  - Merges changes from the template's `main` branch into a new branch in each child repo.
  - Handles merge conflicts according to the selected strategy (abort or create a conflict PR).
  - Optionally creates a pull request in each child repository for review and merging.
  - If there are no conflicts, can auto-merge into `main` in the child repo.

### Setup

1. Edit `.github/child-repositories.json` to add or remove child repositories.
2. Create a Personal Access Token (PAT) with `repo` permissions.
3. Add the token as a repository secret named `PAT_TOKEN`.

### Usage

1. Go to the Actions tab in GitHub.
2. Select the "Update Child Repositories" workflow.
3. Click "Run workflow" and configure the options:
   - Commit message for the update
   - Branch name to create in child repositories
   - Whether to create a pull request
   - Conflict strategy (abort or PR)
4. Click "Run workflow" to start the process.

---

## 2. Configuration: `.github/child-repositories.json`

- **Purpose:** Lists all child repositories that should receive updates from the template.
- **Format:**
  ```json
  {
  	"repositories": [
  		{
  			"name": "Super Baukasten",
  			"url": "https://github.com/matthacksteiner/super"
  		},
  		{
  			"name": "Betina Ammann Physio",
  			"url": "https://github.com/matthacksteiner/betinaamann-physio.at"
  		}
  	]
  }
  ```
- **How to use:**
  - Add or remove repositories as needed to control which projects receive updates.

---

## 3. Best Practices

- Keep template-only files (like update workflows and child-repositories.json) in the `template-tool` branch.
- Only files in `main` will be copied to new repositories created from the template.
- Document any changes to the update process or configuration in this README.

---

For questions or improvements, please open an issue or PR in the template repository.
