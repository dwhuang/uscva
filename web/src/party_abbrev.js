module.exports = {
  GetPartyAbbrev: function(partyName) {
    switch (partyName) {
      case 'Adams': return 'Adams';
      case 'Adams-Clay Federalist': return 'Adams-Clay F';
      case 'Adams-Clay Republican': return 'Adams-Clay R';
      case 'Anti-Jackson': return 'AJ';
      case 'American': return 'Am';
      case 'Anti-Administration': return 'Anti-Admin';
      case 'Conservative': return 'C';
      case 'Crawford Republican': return 'CRR';
      case 'Democrat': return 'D';
      case 'Democratic Republican (Jeffersonian)': return 'DR';
      case 'Federalist': return 'F';
      case 'Farmer-Labor': return 'FL';
      case 'Free Soiler': return 'FS';
      case 'Independent': return 'I';
      case 'Independent Democrat': return 'ID';
      case 'Independent Republican': return 'IR';
      case 'Jacksonian': return 'J';
      case 'Jackson Republican': return 'JR';
      case 'Liberal Republican': return 'LR';
      case 'Nullifier': return 'N';
      case 'National Republican': return 'NR';
      case 'Opposition': return 'OP';
      case 'Populist': return 'PO';
      case 'Pro-Administration': return 'Pro-Admin';
      case 'Progressive': return 'PR';
      case 'Republican': return 'R';
      case 'Readjuster': return 'RA';
      case 'Silver Republican': return 'SR';
      case 'Silver': return 'S';
      case 'Unionist': return 'U';
      case 'Unconditional Unionist': return 'UU';
      case 'Whig': return 'W';
    }
    return null;
  }
};
