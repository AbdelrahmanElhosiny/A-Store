// External links used in the footer and the version chip
const REPO_URL = "https://github.com/AbdelrahmanElhosiny/A-Store";
// the hand-written version, frozen at tag v1-classic
const CLASSIC_SOURCE = `${REPO_URL}/tree/v1-classic`;

const EXTERNAL_LINK = {
  REPO: REPO_URL,
  AI_LOG: `${REPO_URL}/blob/AI-enhanced/docs/AI-LOG.md`,
  CLASSIC_SOURCE,
  // the classic version running live; its code until that address exists
  CLASSIC_SITE: import.meta.env.VITE_CLASSIC_URL || CLASSIC_SOURCE,
  // everything AI changed since the classic version
  AI_COMPARE: `${REPO_URL}/compare/master...AI-enhanced`,
};

export { EXTERNAL_LINK };
