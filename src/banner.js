import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';

// ─── palette ──────────────────────────────────────────────────────────────────

const TEAL = '#2EC4B6';
const PINK = '#F72585';

const brandGradient = gradient(TEAL, PINK);

// ─── banner ───────────────────────────────────────────────────────────────────

// renders the full gitwrit banner:
//   - BlurVision ASCII art in teal→pink gradient
//   - tagline with git (teal) and writ (pink) colored separately
//   - subtitle dimmed
//
// shown on:
//   - gitwrit init  (first run only)
//   - gitwrit help

export function renderBanner() {
  const ascii = figlet.textSync('gitwrit', {
    font: 'BlurVision ASCII',
    horizontalLayout: 'default',
  });

  // apply gradient line by line so the block characters catch
  // the color transition at different densities (░ ▒ ▓)
  const colored = brandGradient.multiline(ascii);

  // tagline — git in teal, writ in pink, rest dimmed
  const tagline =
    chalk.dim('  Made for ') +
    chalk.hex(TEAL).bold('`git`') +
    chalk.dim('-ters and ') +
    chalk.hex(PINK).bold('`writ`') +
    chalk.dim('-ters.');

  // subtitle
  const subtitle = chalk.dim(
    '  Private, versioned writing for people who live in the terminal.'
  );

  console.log();
  console.log(colored);
  console.log(subtitle);
  console.log(tagline);
  console.log();
}