const fs = require('fs');

/*
  Return absolute path for any file in React component dir
*/
const componentRootDir = subPath => (
  `src/app/components/${subPath || ''}`
);

/*
  Retrieve collection of Sass files in React components dir
  Wrapper for the recursive populateSassFiles function
*/
const fetchSassFiles = () => {
  const sassFiles = [];
  populateSassFiles('', sassFiles);
  return sassFiles;
};

/*
  Recursively search through React components dir for Sass files
  Populate @sassFiles with any Sass files that are found
*/
const populateSassFiles = (subPath, sassFiles) => {
  let compDir, newPath, fstat;
  const files = fs.readdirSync(componentRootDir(subPath));
  files.forEach(f => {
    newPath = subPath ? `${subPath}/${f}` : f;
    compDir = componentRootDir(newPath);
    fstat = fs.statSync(compDir);
    if (fstat.isDirectory()) populateSassFiles(newPath, sassFiles);
    if (f.match(/.scss/)) sassFiles.push(compDir);
  });
};

/*
  Rewrite Sass file at @indexFile with new imports
  Does NOT rewrite if React component Sass files have not changed
  New @indexFile is written by:
  - Splitting the contents of @indexFile based on a @marker string
  - Writing a new @indexFile that:
    - Preserves everything before @marker
    - Writes new import statements using @sassFiles after @marker
*/
const buildSassIndex = (indexFile, marker, sassFiles) => {
  const content = fs.readFileSync(indexFile, 'utf8');
  const [preservedContent, existingImports] = content.split(marker);

  if (!changeInComponentSass(existingImports, sassFiles)) {
    console.log(`Skipping rewrite of ${indexFile}`);
    return;
  }

  console.log('Change in React component Sass files detected');
  console.log(`Rewriting ${indexFile} with new imports...`);
  const newContent = preservedContent +
    `${marker}\n\n` +
    sassFiles.map(sf => (
      `@import '${sf}';\n`
    )).join('');
  fs.writeFileSync(indexFile, newContent);
  console.log('Done!');
};

/*
  Compare and determine if there is a difference between:
  - @oldSassImports: string of imports currently in Sass index file
  - @newSassFiles: component Sass files identified by this script
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
