# InsightIQ branch and worktree guide

This repository keeps internal working instructions separate from product
code and other user-facing content. The `docs` branch is the dedicated home
for internal documents.

## Required repository layout

Maintain these two sibling worktrees:

| Purpose | Path | Branch |
| --- | --- | --- |
| Main project checkout | `/path/to/InsightIQ` | `main` |
| Internal documentation checkout | `/path/to/InsightIQ-docs` | `docs` |

The exact parent directory may differ on another machine, but the two
worktrees must remain separate and the branch-to-purpose mapping must not
change.

## Branch isolation rules

1. Only internal project documentation and documentation-specific maintenance
   may be changed on `docs`.
2. Do not merge, rebase, cherry-pick, or otherwise bring commits from `docs`
   into `main` or any other branch.
3. Do not merge, rebase, cherry-pick, or otherwise bring commits from `main`
   or another branch into `docs`.
4. The `main` branch must not contain internal operating instructions. Keep it
   limited to user-facing product content and project implementation.
5. Do not make code, deployment, dependency, schema, configuration, or other
   product changes in the `docs` worktree.
6. Do not make internal-only documentation changes in the `main` worktree.
7. Before editing, confirm both the current path and branch. If either does
   not match the intended purpose, stop and correct the checkout first.

These are intentionally separate histories of work, not a workflow where one
branch is periodically synchronized with the other. The `docs` branch may be
published to the public repository as a separate branch, but its commits must
remain on that branch.

## Where to work

For application work, use the main checkout:

```bash
cd /path/to/InsightIQ
git switch main
```

For internal documentation work, use the documents checkout:

```bash
cd /path/to/InsightIQ-docs
git switch docs
```

Useful checks:

```bash
pwd
git branch --show-current
git status --short --branch
git worktree list
```

## Creating the layout on a new machine

Starting from the main clone, create the sibling documents worktree with:

```bash
cd /path/to/InsightIQ
git switch main
git worktree add ../InsightIQ-docs docs
```

If Git reports that `docs` is already checked out, another worktree owns the
branch. Use `git worktree list` to find it; do not force a second checkout.

## Commit and review expectations

Commit documentation changes from the `docs` worktree and push them to the
`docs` branch only:

```bash
cd /path/to/InsightIQ-docs
git add docs/
git commit -m "docs: update internal guidance"
git push origin docs
```

Reviewers and agents should inspect the branch and worktree before making any
change. If a task asks for both product changes and internal documentation,
perform them as separate changes in their respective worktrees. Do not use a
merge or cherry-pick to combine them; keep the commits and branches isolated.

## Recovery if the layout is wrong

If the main checkout is accidentally on `docs`, and it is clean, switch it
back to `main` and ensure the sibling worktree owns `docs`:

```bash
cd /path/to/InsightIQ
git status
git switch main
git worktree list
```

If there are uncommitted changes, do not reset or discard them. Stop and get
the owner’s direction before moving or saving them.
