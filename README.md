# 🐉 GitHub 4-Star Dragon Ball Contribution

A custom animated SVG that uses the GitHub contribution calendar as the path for a four-star Dragon Ball.

## 1. Copy the files

Put these into your profile repository:

```text
Aryan5x/
├── generate.js
├── output/
│   └── dragonball-contribution.svg
└── .github/
    └── workflows/
        └── dragonball.yml
```

## 2. Run the Action

Open:

**GitHub → Actions → 🐉 Generate 4-Star Dragon Ball → Run workflow**

The workflow creates:

```text
output/dragonball-contribution.svg
```

## 3. Put it in your README

```html
<p align="center">
  <img
    src="https://raw.githubusercontent.com/Aryan5x/Aryan5x/main/output/dragonball-contribution.svg"
    alt="4-star Dragon Ball contribution animation"
    width="100%"
  />
</p>
```

## Do I need a GitHub token?

**You do not need to create a personal access token for this setup.**

The GitHub Action automatically gives the workflow a temporary `GITHUB_TOKEN`. The script uses that token to query GitHub's GraphQL contribution calendar.

If you later want to include contribution information that requires user-level/private access, you may need a separately configured token with appropriate permissions. Do NOT paste a token directly into `generate.js`.

## Important

If your profile repository is not named exactly like your username, this still works as long as the repository owner is the account whose contributions you want.

For `Aryan5x/Aryan5x`, the workflow automatically uses:

```text
GITHUB_USERNAME=Aryan5x
```
