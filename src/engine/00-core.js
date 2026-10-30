  const hyp = (a, b, c = 0) => Math.sqrt(a * a + b * b + c * c);
  let FONTS = __DATA__("fonts.json");
  NP.setFonts = (f) => { FONTS = f; };

