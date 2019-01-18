/**
 * This is a script that updates the project's index.scss file
 * with @import statements pointing to .scss files in the src/app
 * directory.
 *
 * This script will need to be run every time a new .scss file is created
 * for a component.
 */

const fs = require('fs');

/**
 * Return the absolute path for any file in src/app
 */
const appDir = subPath => (
  `src/app/${subPath || ''}`
);

/**
 * Generate collection of .scss files in src/app
 * This is a wrapper for the recursive populateSassFiles function below
 */
const fetchSassFiles = () => {
  const sassFiles = [];
  populateSassFiles('', sassFiles);
  return sassFiles;
};

/**
 * Recursively search through the src/app directory for .scss files
 * Populate @sassFiles with any .scss files that are found
 */
const populateSassFiles = (subPath, sassFiles) => {
  let compDir, newPath, fstat;
  const files = fs.readdirSync(appDir(subPath));
  files.forEach(f => {
    newPath = subPath ? `${subPath}/${f}` : f;
    compDir = appDir(newPath);
    fstat = fs.statSync(compDir);
    if (fstat.isDirectory()) populateSassFiles(newPath, sassFiles);
    if (f.match(/.scss/)) sassFiles.push(compDir);
  });
};

/**
 * Rewrite index.scss @indexFile with new imports
 * Does NOT rewrite if .scss files have not been added/removed
 * New @indexFile is written by:
 * - Splitting the contents of @indexFile based on a @marker string
 * - Writing a new @indexFile that:
 * - Preserves everything before @marker
 * - Writes new import statements using @sassFiles after @marker
 */
const buildSassIndex = (indexFile, marker, sassFiles) => {
  const content = fs.readFileSync(indexFile, 'utf8');
  const [preservedContent, existingImports] = content.split(marker);

  if (!changeInComponentSass(existingImports, sassFiles)) {
    console.log(`Skipping rewrite of ${indexFile}...`);
    return;
  }

  console.log('Change in React Sass files detected...');
  console.log(`Rewriting ${indexFile} with new imports...`);
  const newContent = preservedContent +
    `${marker}\n\n` +
    sassFiles.map(sf => (
      `@import '${sf}';\n`
    )).join('');
  fs.writeFileSync(indexFile, newContent);
  console.log('Done!');
};

/**
 * Compare and determine if there is a difference between:
 * - @oldSassImports: string of imports currently in index.scss
 * - @newSassFiles: Component .scss files identified by this script
 */
const changeInComponentSass = (oldSassImports, newSassFiles) => {
  const oldSassFiles = oldSassImports.split('\n').filter(ei => ei).map(ei => (
    ei.replace(/'|@import|;|\s/g, '')
  ));
  if (oldSassFiles.length !== newSassFiles.length) return true;
  oldSassFiles.forEach((osf, i) => {
    if (osf !== newSassFiles[i]) return true;
  });
  return false;
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const main = () => {
  const sassIndex = 'src/styles/scss/index.scss';
  const marker = '/* buildSassIndex */';
  const sassFiles = fetchSassFiles();
  if (sassFiles.length > 0) {
    buildSassIndex(sassIndex, marker, sassFiles);
  }
};

main();
