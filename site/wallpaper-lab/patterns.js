// Point groups refer to the book's source patterns, not unverified reconstructions.
window.PATTERNS = [
  ['Curved interlock','C₁'], ['Zigzag interlock','C₂'], ['Three-way interlock','C₃'],
  ['Four-way stars','C₄'], ['Six-way pinwheels','C₆'], ['Pointed strips','D₁'],
  ['Angular strips','D₁'], ['Scalloped scales','D₁'], ['Diamonds','D₂'],
  ['Herringbone','D₂'], ['Wavy bands','D₂'], ['Brick wall','D₂'],
  ['Overlapping circles','D₄'], ['Square stars','D₄'], ['Hexagonal tiles','D₃'],
  ['Fleur-de-lis','D₃'], ['Circular rosettes','D₆']
].map(([name, pointGroup], i) => ({ id: i + 1, name, pointGroup }));
