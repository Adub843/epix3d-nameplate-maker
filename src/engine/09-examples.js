  /* =================================================================
     v4: ten ready-made examples per subject
     ================================================================= */
  const EX = {
    basketball: [["Jackson", "#23 Point Guard"], ["Hoops Hangout", ""], ["Coach Davis", "Varsity Basketball"], ["Ballin'", "Est. 2026"], ["Mia", "Nothing But Net"], ["The Court", "Game On"], ["Swish!", ""], ["Tyler's Room", "Slam Dunk Zone"], ["MVP", "Season 2026"], ["Bucket Getter", ""]],
    football: [["Wildcats", "Est. 2026"], ["Coach Carter", "Head Coach"], ["Game Day", ""], ["Mason", "#12 Quarterback"], ["Touchdown Town", ""], ["The End Zone", "Man Cave"], ["Friday Lights", "Go Team!"], ["Big Mike", "Offensive Line"], ["Gridiron Garage", ""], ["Team Captain", "Liam"]],
    soccer: [["Sofia", "#9 Striker"], ["Goal!", ""], ["Coach Rivera", "U12 Soccer"], ["Pitch Perfect", "Est. 2026"], ["Lucas", "Keeper"], ["Soccer Mom HQ", ""], ["The Kickers", "Fall Season"], ["GOOOAL", ""], ["Emma's Room", "Play Hard"], ["Hat Trick", "Champions"]],
    baseball: [["Dugout", "Est. 2026"], ["Coach Miller", "Little League"], ["Batter Up", ""], ["Noah", "#7 Shortstop"], ["Home Run Den", ""], ["Grand Slam", "Champions"], ["Ava", "Softball Star"], ["Play Ball!", ""], ["The Bullpen", "Man Cave"], ["Diamond Kings", "Spring 2026"]],
    hockey: [["Ice Cold", "Est. 2026"], ["Coach Murphy", "Bantam A"], ["Hat Trick Hall", ""], ["Owen", "#88 Center"], ["The Penalty Box", ""], ["Puck Drop", "Game Night"], ["Rink Rat", ""], ["Hockey House", "Go Team"], ["Goalie Zone", "Ethan"], ["Slapshot", ""]],
    tennis: [["Love All", ""], ["Coach Kim", "Tennis Pro"], ["Ace", "Est. 2026"], ["Grace", "Varsity Tennis"], ["Court Side", ""], ["Game Set Match", ""], ["The Baseline", "Club"], ["Serve It Up", ""], ["Olivia", "#1 Singles"], ["Racquet Club", "Members Only"]],
    golf: [["The 19th Hole", "Bar & Grill"], ["Fore!", ""], ["Dad's Den", "Golf Lover"], ["Hole in One", "Club"], ["Coach Allen", "Golf Team"], ["Par-Tee Time", ""], ["The Clubhouse", "Est. 2026"], ["Birdie", ""], ["Fairway Fred", ""], ["Tee Time", "Weekend Only"]],
    volleyball: [["Spike Zone", ""], ["Chloe", "#4 Setter"], ["Coach Lopez", "Volleyball"], ["Dig Pass Kill", ""], ["Net Gains", "Est. 2026"], ["Beach Bum", "Volleyball"], ["Block Party", ""], ["Serve Squad", "Varsity"], ["Lily's Room", "Ace It"], ["Kill Shot", ""]],
    bowling: [["Strike Zone", ""], ["The Alley", "Est. 2026"], ["Bowl-A-Rama", ""], ["Pin Pals", "League Night"], ["Kevin", "300 Club"], ["Split Happens", ""], ["Gutter Gang", "Team Shirt"], ["Lucky Strike", ""], ["Rollin' Ray", ""], ["Spare Me", ""]],
    pickleball: [["Dink Responsibly", ""], ["The Kitchen", "Pickleball Club"], ["Maya", "Pickleball Pro"], ["Pickle Palace", ""], ["Coach Ben", "Pickleball"], ["Dink Dynasty", "Est. 2026"], ["Big Dill", ""], ["Paddle Up", ""], ["Kitchen Rules", "No Volleys"], ["Pickle Party", ""]],
    running: [["Born to Run", ""], ["Sarah", "Marathon Finisher"], ["Mile High", "Running Club"], ["Run Club", "Est. 2026"], ["26.2", "Boston 2026"], ["Coach Reed", "Cross Country"], ["Pace Setter", ""], ["Finish Line", ""], ["Rise & Run", ""], ["Fast Feet", "Jake"]],
    cycling: [["Spin City", ""], ["Ride On", "Est. 2026"], ["The Bike Shed", ""], ["Pedal Power", ""], ["Alex", "Century Rider"], ["Gravel Grinder", ""], ["Chain Gang", "Cycling Club"], ["Tour de Garage", ""], ["Wheelie Good", ""], ["Climb Higher", ""]],
    gym: [["Iron Den", "Est. 2026"], ["Beast Mode", ""], ["Home Gym", "No Excuses"], ["Lift Heavy", ""], ["Coach Tony", "Strength"], ["Gains Garage", ""], ["Swole Patrol", ""], ["Rise & Grind", ""], ["The Pump Room", ""], ["PR Club", "Max Effort"]],
    martial: [["Dojo", "Respect"], ["Sensei Park", "Black Belt"], ["Kai", "Taekwondo"], ["The Mat Room", ""], ["Fight Club", "Est. 2026"], ["Focus", "Discipline"], ["Black Belt", "Mia"], ["Warrior Way", ""], ["Grapple Gym", ""], ["Kick It", ""]],
    cheer: [["Cheer Queen", ""], ["Ava", "Varsity Cheer"], ["Go Team!", ""], ["Dance Studio", "Est. 2026"], ["Pom Squad", ""], ["Twirl", "Ballet"], ["Coach Jen", "Cheer"], ["Flip Zone", "Gymnastics"], ["Shine Bright", ""], ["Spirit!", ""]],
    skate: [["Shred Shed", ""], ["Surf's Up", ""], ["Kickflip", "Est. 2026"], ["Board Room", ""], ["Rad Zone", ""], ["Hang Ten", ""], ["Skate Park", "Leo"], ["Wave Rider", ""], ["Ollie", ""], ["Salt Life", ""]],
    snow: [["Ski Lodge", "Est. 2026"], ["Powder Day", ""], ["Snow Bunny", ""], ["The Chalet", ""], ["Apres Ski", "Bar"], ["Black Diamond", ""], ["Shred Pow", ""], ["Mountain Time", ""], ["Let It Snow", ""], ["Ski Bum", "Max"]],
    movies: [["Home Theater", "Now Showing"], ["Movie Night", ""], ["The Hendersons", "Cinema"], ["Screening Room", ""], ["Popcorn Palace", ""], ["Main Feature", "Est. 2026"], ["Director", "Dad"], ["Lights Camera Action", ""], ["Reel Room", ""], ["Cinema Paradiso", ""]],
    tv: [["Binge Zone", ""], ["Den", "Est. 2026"], ["Couch Potato HQ", ""], ["The TV Room", ""], ["Remote Control", "Dad Only"], ["Prime Time", ""], ["Stream Team", ""], ["Snack & Watch", ""], ["Channel 9", ""], ["Next Episode", ""]],
    cars: [["Riley's Garage", "Est. 2026"], ["Pit Stop", ""], ["Dad's Garage", "Open 24/7"], ["Speed Shop", ""], ["Hot Rod Haven", ""], ["Motor Mike", ""], ["Full Throttle", ""], ["Car Guy", "Parking Only"], ["Turbo", ""], ["Grease Monkey", "Garage"]],
    music: [["Riley", "Rock On"], ["Studio B", "Recording"], ["Jam Room", ""], ["Rock & Roll", "Est. 2026"], ["The Stage", ""], ["DJ Mike", ""], ["Band Practice", ""], ["Vinyl Vault", ""], ["Encore", ""], ["Music Room", "Play Loud"]],
    fishing: [["Gone Fishing", ""], ["Reel Cool Dad", ""], ["Lake Life", "Fishing Camp"], ["The Tackle Box", ""], ["Bass Pro Pete", ""], ["Fish Tales", "Est. 2026"], ["Hooked", ""], ["Catch & Release", ""], ["Fisherman's Den", ""], ["O-Fish-Al", ""]],
    hunting: [["Big Buck", "Est. 2026"], ["Deer Camp", ""], ["The Lodge", ""], ["Hunter's Den", ""], ["Duck Blind", ""], ["Trophy Room", ""], ["Camo Cave", ""], ["Opening Day", ""], ["Elk Country", ""], ["Hunt Club", "Members"]],
    camping: [["Happy Camper", ""], ["Camp Miller", "Est. 2026"], ["The Campsite", ""], ["S'mores Bar", ""], ["Glamping", ""], ["Basecamp", ""], ["RV There Yet?", ""], ["Campfire Stories", ""], ["Tent City", ""], ["Wild Ones", ""]],
    hiking: [["Trail Blazer", ""], ["Peak Bagger", ""], ["Take a Hike", ""], ["Summit", "Est. 2026"], ["Trailhead", ""], ["Wander", ""], ["Mountain Mama", ""], ["Hike Club", ""], ["Off the Grid", ""], ["Basecamp", "Hiking"]],
    boating: [["Lake House", "Est. 2026"], ["Dock Bar", ""], ["Captain Jack", ""], ["Anchors Away", ""], ["Lake Life", ""], ["The Marina", ""], ["Boat Days", ""], ["First Mate", "Mom"], ["Sea Breeze", ""], ["Paddle Club", "Kayak"]],
    beach: [["Beach House", ""], ["Salty Air", ""], ["Shell Yeah", ""], ["Island Time", ""], ["Sandy Toes", ""], ["Beach Please", ""], ["Tiki Bar", "Open"], ["Sunny Days", ""], ["Coastal Cottage", ""], ["Aloha", ""]],
    birding: [["Bird Nerd", ""], ["Feeder Watch", ""], ["Tweet Retreat", ""], ["Nature Nook", ""], ["Wild Wings", ""], ["Early Bird", ""], ["Bird Club", "Est. 2026"], ["Field Notes", ""], ["Nest", ""], ["Wildlife", "Watcher"]],
    ranch: [["The Ranch", "Est. 2026"], ["Barn", ""], ["Cowgirl Up", ""], ["Lucky Horseshoe", ""], ["Saddle Up", ""], ["Rodeo Ready", ""], ["Tack Room", ""], ["Howdy", ""], ["Farm Fresh", ""], ["Stable", "Bella"]],
    kitchen: [["Mom's Kitchen", ""], ["Chef Lily", ""], ["Bake Shop", "Est. 2026"], ["Grandma's Kitchen", ""], ["Kitchen Rules", ""], ["Home Cookin'", ""], ["Sweet Treats", ""], ["The Pantry", ""], ["Bon Appetit", ""], ["Made with Love", ""]],
    grill: [["Grill Master", ""], ["Dad's BBQ", "Est. 2026"], ["Pit Boss", ""], ["Smoke Shack", ""], ["The Grill", "Open"], ["Low & Slow", ""], ["BBQ Pit", ""], ["Sizzle", ""], ["Meat Sweats", ""], ["Grill Sergeant", ""]],
    books: [["Book Nook", ""], ["Reading Corner", ""], ["Library", "Est. 2026"], ["Bookworm", ""], ["Book Club", ""], ["Chapter One", ""], ["Story Time", ""], ["Quiet Please", ""], ["Plot Twist", ""], ["Read More", ""]],
    pets: [["Buddy", "Good Boy"], ["Luna", ""], ["Dog House", ""], ["Cat Nap", ""], ["Bark Park", ""], ["Paws Here", ""], ["Max", "Est. 2026"], ["Kitty Corner", ""], ["Fur Babies", ""], ["Woof!", ""]],
    gaming: [["Game Room", ""], ["Player One", ""], ["Level Up", ""], ["Gamer Zone", "Do Not Disturb"], ["Respawn", ""], ["GG", ""], ["Noob Free Zone", ""], ["Boss Level", ""], ["Press Start", ""], ["Arcade", "Est. 2026"]],
    gameroom: [["Game Night", ""], ["Cornhole Champs", ""], ["Poker Room", ""], ["Checkmate", ""], ["The Dart Board", ""], ["Card Sharks", ""], ["Roll the Dice", ""], ["Rec Room", "Est. 2026"], ["Bullseye", ""], ["All In", ""]],
    photo: [["Studio", "Est. 2026"], ["Say Cheese", ""], ["Darkroom", ""], ["Shutter Bug", ""], ["Focus", ""], ["Snap Shots", ""], ["Photo Booth", ""], ["Golden Hour", ""], ["Picture This", ""], ["Click", ""]],
    crafts: [["Craft Room", ""], ["Knit Happens", ""], ["Studio", "Art"], ["Sew Fun", ""], ["Maker Space", ""], ["Yarn Barn", ""], ["Create", ""], ["Art Room", "Est. 2026"], ["Glue & Glitter", ""], ["Paint Party", ""]],
    garden: [["Grandma's Garden", ""], ["Grow", ""], ["The Greenhouse", ""], ["Plant Lady", ""], ["Bloom", ""], ["Garden Shed", "Est. 2026"], ["Dig In", ""], ["Herb Garden", ""], ["Potting Shed", ""], ["Sprout", ""]],
    workshop: [["Dad's Workshop", ""], ["The Shop", "Est. 2026"], ["Maker Space", ""], ["Wood Shop", ""], ["Fix It", ""], ["Tool Time", ""], ["Sawdust", ""], ["Handyman", ""], ["Build Zone", ""], ["Measure Twice", ""]],
    travel: [["Wanderlust", ""], ["Adventure Awaits", ""], ["Explore", "Est. 2026"], ["Jet Setter", ""], ["Passport", ""], ["Globe Trotter", ""], ["Road Trip", ""], ["Bon Voyage", ""], ["Next Stop", ""], ["Oh the Places", ""]],
    drinks: [["The Hendersons", "Est. 2026"], ["Home Bar", ""], ["Cheers!", ""], ["Happy Hour", "Open Daily"], ["Brew Pub", ""], ["Wine Down", ""], ["The Tap Room", ""], ["Man Cave", "Bar"], ["Sips & Sports", ""], ["Bar Open", ""]],
    coffee: [["Coffee Bar", ""], ["But First Coffee", ""], ["Espresso Yourself", ""], ["The Daily Grind", ""], ["Brew Ha Ha", ""], ["Latte Love", ""], ["Cafe", "Est. 2026"], ["Bean There", ""], ["Mug Life", ""], ["Wake Up", ""]],
  };
  const FUN_ALL = ["burst", "arch", "bubble", "crest"];
  const ALT_PAL = ["pop", "retro", "candy", "neon", "citrus", "tropic", "victory", "sky"];
  NP.examplesFor = function (sp) {
    const list = EX[sp.key] || [["Champion", ""], ["Name Here", "Est. 2026"], ["Welcome", ""], ["The Best", ""], ["Team", ""], ["Home", ""], ["Hello", ""], ["My Room", ""], ["Star", ""], ["Legend", ""]];
    const designs = (sp.designs || []).filter((d) => DESIGNS[d]);
    const order = designs.concat(FUN_ALL.filter((d) => !designs.includes(d))).concat(["classic", "badge", "marquee", "ticket", "license", "jersey", "pennant"].filter((d) => !designs.includes(d)));
    return list.map(([name, sub], i) => {
      // mostly fun styles, a few simple ones for single-color printers
      const design = i < 7 ? order[i % Math.min(order.length, 4)] : order.filter((d) => !DESIGNS[d].fun)[i - 7] || "classic";
      const palette = i % 3 === 2 ? ALT_PAL[(i + sp.key.length) % ALT_PAL.length] : sp.palette;
      const icon = sp.icons[i % sp.icons.length];
      const tools = (sp.tools || []).filter((k) => k !== icon);
      const items = DESIGNS[design].fun && i % 2 === 0 ? [{ key: tools[(i / 2) % tools.length], size: 13, rot: (i * 17) % 40 - 20, mode: "add", slot: "bold" }].concat(i % 4 === 0 ? [{ key: tools[(i / 2 + 1) % tools.length], size: 11, rot: 0, mode: "add", slot: "accent" }] : []) : [];
      return { name, sub, design, palette, icon, items, number: design === "jersey" ? String(((i * 7) % 98) + 1) : "" };
    });
  };

