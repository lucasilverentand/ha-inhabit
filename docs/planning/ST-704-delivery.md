# ST-704 delivery: suggestion-first planning workflow

Linear issue **ST-704** belongs in the [lucasilverentand/skills](https://github.com/lucasilverentand/skills) repository (`plugins/linear-planner` and `plugins/project-docs`), not in ha-inhabit.

This workspace had no push access to that repo during the agent run. Apply the included patch at the repository root:

```bash
git clone https://github.com/lucasilverentand/skills.git
cd skills
git checkout -b cursor/suggestion-first-planning-workflow-f24d
git am /path/to/st-704-skills-workflow.patch
export PATH="$HOME/.bun/bin:$PATH"
bun run marketplace:write
bun run check
git push -u origin cursor/suggestion-first-planning-workflow-f24d
```

Then open a PR against `main` and set the Cursor Cloud default repository to `lucasilverentand/skills` for future doc-template work.

## Canonical workflow location (after patch)

- `plugins/linear-planner/skills/agent-planning-workflow/SKILL.md`
- `plugins/linear-planner/skills/agent-planning-workflow/references/suggestion-first-planning-workflow.md`
