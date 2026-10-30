/* Word Garden content. Original curriculum data, sequenced for synthetic phonics. */
window.WG_CONTENT = {
  phonemes: {
    b:{file:"b"}, d:{file:"d"}, f:{file:"f"}, g:{file:"g"}, h:{file:"h"}, j:{file:"j"},
    k:{file:"k"}, l:{file:"l"}, m:{file:"m"}, n:{file:"n"}, p:{file:"p"}, r:{file:"r"},
    s:{file:"s"}, t:{file:"t"}, v:{file:"v"}, w:{file:"w"}, y:{file:"y"}, z:{file:"z"},
    sh:{file:"sh"}, ch:{file:"ch"}, th:{file:"th"}, th_v:{file:"th_v"}, ng:{file:"ng"},
    qu:{file:"qu"}, x:{file:"x"},
    tch:{file:"ch"}, ph:{file:"f"}, wh:{file:"w"}, kn:{file:"n"}, wr:{file:"r"},
    a:{file:"a"}, e:{file:"e"}, i:{file:"i"}, o:{file:"o"}, u:{file:"u"},
    c:{file:"k"}, ck:{file:"k"}, igh:{file:"ie"}, ea:{file:"ee"}, ew:{file:"ue"},
    ai:{file:"ay"}, a_e:{file:"ay"}, i_e:{file:"ie"}, e_e:{file:"ee"}, o_e:{file:"oa"},
    ow_long:{file:"oa"}, u_e:{file:"ue"}, ir:{file:"er"}, ur:{file:"er"}, oe:{file:"oa"}, oy:{file:"oi"}, au:{file:"aw"},
    ay:{file:"ay"}, ee:{file:"ee"}, ie:{file:"ie"}, oa:{file:"oa"}, oo:{file:"oo"},
    oo_short:{file:"oo_short"}, ue:{file:"ue"}, ow:{file:"ow"}, oi:{file:"oi"},
    aw:{file:"aw"}, ar:{file:"ar"}, er:{file:"er"}, or:{file:"or"}, air:{file:"air"}, ear:{file:"ear"}
  },

  levels: [
    {
      id:"l1", title:"First Sounds", grade:"Pre-K", color:"#6E9B6A",
      intro:"Listen for the first sounds.",
      note:"Short vowels and high-utility consonants, introduced one at a time.",
      sounds:["s","a","t","p","i","n","m","d"],
      note2:"Individual letter sounds only; blending starts after every letter is introduced.",
      words:[]
    },
    {
      id:"l2", title:"More Sounds", grade:"K", color:"#5E8FA8",
      intro:"New sounds, new words.",
      note:"Finish the single-letter sounds before blending begins.",
      sounds:["g","o","c","k","e","u","r","h","b","f","l","j","v","w","x","y","z","qu"],
      words:[
        ["cat","\u{1F431}"],["dog","\u{1F436}"],["sun","\u2600\uFE0F"],["cup","\u{1F964}"],["bed","\u{1F6CF}\uFE0F"],["bug","\u{1F41B}"],
        ["hat","\u{1F3A9}"],["hen","\u{1F414}"],["pig","\u{1F437}"],["log","\u{1FAB5}"],["mop","\u{1F9F9}"],["net","\u{1F945}"],
        ["pot","\u{1F372}"],["red","\u{1F534}"],["run","\u{1F3C3}"],["ten","\u{1F51F}"],["tub","\u{1F6C1}"],["gum","\u{1F36C}"],
        ["hug","\u{1F917}"],["mud","\u{1F7E4}"],["bun","\u{1F35E}"],["bus","\u{1F68C}"],["cut","\u2702\uFE0F"],["fun","\u{1F389}"],
        ["hot","\u{1F525}"],["big","\u{1F418}"],["dig","\u26CF\uFE0F"],["lid","\u{1FAD9}"],["lip","\u{1F444}"],["rip","\u{1F4C4}"]
      ]
    },
    {
      id:"l3", title:"Sound Teams", grade:"K", color:"#A8785E",
      intro:"Two letters can make one sound.",
      sounds:["sh","ch","th","ck"],
      contextualPatterns:["ng","th_v"],
      words:[
        ["ship","\u{1F6A2}"],["shop","\u{1F3EA}"],["fish","\u{1F41F}"],["dish","\u{1F37D}\uFE0F"],["shell","\u{1F41A}"],
        ["chip","\u{1F35F}"],["chin","\u{1F9D1}"],["chop","\u{1FA93}"],["lunch","\u{1F371}"],["rich","\u{1F4B0}"],
        ["thin","\u{1F9CD}"],["thick","\u{1F9F1}"],["bath","\u{1F6C1}"],["moth","\u{1F98B}"],["math","\u2797"],
        ["ring","\u{1F48D}"],["king","\u{1F934}"],["sing","\u{1F3A4}"],["long","\u{1F4CF}"],["song","\u{1F3B5}"],
        ["wing","\u{1FAB6}"],["queen","\u{1F451}"],["quiz","\u2753"],["jet","\u2708\uFE0F"],["jam","\u{1F353}"],
        ["jar","\u{1FAD9}"],["vet","\u{1FA7A}"],["van","\u{1F690}"],["wet","\u{1F4A7}"],["web","\u{1F578}\uFE0F"],
        ["win","\u{1F3C6}"],["wax","\u{1F56F}\uFE0F"],["box","\u{1F4E6}"],["fox","\u{1F98A}"],["six","6\uFE0F\u20E3"],
        ["yes","\u2705"],["yell","\u{1F4E2}"],["zip","\u{1F910}"],["zoo","\u{1F993}"],["buzz","\u{1F41D}"],
        ["sock","\u{1F9E6}"],["duck","\u{1F986}"],["lock","\u{1F512}"],["kick","\u{1F9B5}"],["neck","\u{1F992}"],
        ["back","\u{1F519}"],["rock","\u{1FAA8}"]
      ]
    },
    {
      id:"l4", title:"Sound Blends", grade:"K-1", color:"#7A6E9B",
      intro:"Push the sounds together.",
      sounds:[],
      words:[
        ["stop","\u{1F6D1}"],["step","\u{1F463}"],["spin","\u{1F300}"],["spot","\u{1F534}"],["swim","\u{1F3CA}"],
        ["snap","\u{1FAF0}"],["sled","\u{1F6F7}"],["slip","\u{1F97F}"],["clap","\u{1F44F}"],["clip","\u{1F4CE}"],
        ["flag","\u{1F6A9}"],["frog","\u{1F438}"],["drip","\u{1F4A7}"],["drum","\u{1F941}"],["crab","\u{1F980}"],
        ["crib","\u{1F6CF}\uFE0F"],["grab","\u270A"],["grin","\u{1F601}"],["trap","\u{1FAA4}"],["trip","\u{1F9F3}"],
        ["tree","\u{1F333}"],["milk","\u{1F95B}"],["help","\u{1F198}"],["hand","\u270B"],["jump","\u{1F998}"],
        ["tent","\u26FA"],["lamp","\u{1F4A1}"],["desk","\u{1FA91}"],["nest","\u{1FAB9}"],["fast","\u26A1"],
        ["best","\u{1F3C5}"],["gift","\u{1F381}"],["soft","\u{1F9F8}"],["went","\u{1F6B6}"],["bump","\u{1F915}"],
        ["camp","\u{1F3D5}\uFE0F"],["stamp","\u{1F4EE}"],["bell","\u{1F514}"],["hill","\u26F0\uFE0F"],["well","\u{1FAA3}"],
        ["mess","\u{1F9F9}"],["kiss","\u{1F48B}"],["class","\u{1F3EB}"],["off","\u{1F50C}"],["puff","\u2601\uFE0F"]
      ]
    },
    {
      id:"l5", title:"Long Vowels", grade:"1", color:"#B08A4A",
      intro:"Silent e and vowel teams.",
      sounds:["ay","ee","ie","oa","oo","oo_short","ue","ow","oi","aw","ar","er","or"],
      words:[
        ["cake","\u{1F382}"],["bike","\u{1F6B2}"],["kite","\u{1FA81}"],["nose","\u{1F443}"],["rope","\u{1FAA2}"],
        ["cube","\u{1F9CA}"],["tube","\u{1F9EA}"],["home","\u{1F3E0}"],["bone","\u{1F9B4}"],["gate","\u{1F6AA}"],
        ["name","\u{1F3F7}\uFE0F"],["game","\u{1F3AE}"],["wave","\u{1F44B}"],["five","5\uFE0F\u20E3"],["nine","9\uFE0F\u20E3"],
        ["rice","\u{1F35A}"],["mice","\u{1F42D}"],["fire","\u{1F525}"],["tire","\u{1F6DE}"],["bee","\u{1F41D}"],
        ["tree","\u{1F333}"],["feet","\u{1F9B6}"],["seed","\u{1F331}"],["green","\u{1F7E2}"],["sheep","\u{1F411}"],
        ["rain","\u{1F327}\uFE0F"],["train","\u{1F682}"],["tail","\u{1F415}"],["mail","\u{1F4EC}"],["boat","\u26F5"],
        ["coat","\u{1F9E5}"],["goat","\u{1F410}"],["road","\u{1F6E3}\uFE0F"],["snow","\u2744\uFE0F"],["grow","\u{1F331}"],
        ["food","\u{1F34E}"],["moon","\u{1F319}"],["spoon","\u{1F944}"],["book","\u{1F4D6}"],["look","\u{1F440}"],
        ["foot","\u{1F9B6}"],["car","\u{1F697}"],["star","\u2B50"],["farm","\u{1F69C}"],["park","\u{1F3DE}\uFE0F"],
        ["bird","\u{1F426}"],["girl","\u{1F467}"],["shirt","\u{1F455}"],["horn","\u{1F4EF}"],["corn","\u{1F33D}"],["fork","\u{1F374}"]
      ]
    },
    {
      id:"l6", title:"Big Words", grade:"1-2", color:"#8B6B7D",
      intro:"Longer words and spelling patterns.",
      sounds:["igh","ew","ue","oi","ow","aw"],
      words:[
        ["light","\u{1F4A1}"],["night","\u{1F319}"],["high","\u{1F9D2}\u{1F6DD}"],["right","\u27A1\uFE0F"],["pie","\u{1F967}"],
        ["tie","\u{1F454}"],["blue","\u{1F535}"],["glue","\u{1F9F4}"],["clue","\u{1F50D}"],["new","\u{1F195}"],
        ["few","\u{1F522}"],["saw","\u{1FA9A}"],["paw","\u{1F43E}"],["draw","\u{1F3A8}"],["coin","\u{1FA99}"],
        ["boy","\u{1F466}"],["toy","\u{1F9F8}"],["cow","\u{1F404}"],["owl","\u{1F989}"],["out","\u{1F6AA}"],
        ["house","\u{1F3E0}"],["mouse","\u{1F42D}"],["cloud","\u2601\uFE0F"],["round","\u2B55"],["sound","\u{1F50A}"],
        ["table","\u{1FA91}"],["little","\u{1F90F}"],["happy","\u{1F60A}"],["rabbit","\u{1F430}"],["kitten","\u{1F431}"],
        ["pumpkin","\u{1F383}"],["sunset","\u{1F307}"],["football","\u{1F3C8}"],["playground","\u{1F3DE}\uFE0F"]
      ]
    }
  ],

  heartWords: [
    {w:"the", g:"th e", p:["th_v","u"], heart:[1], level:3, phrase:"the cat"},
    {w:"a", g:"a", p:["u"], heart:[0], level:3, phrase:"a bug"},
    {w:"I", g:"i", p:["ie"], heart:[0], level:3, phrase:"I can run"},
    {w:"to", g:"t o", p:["t","oo"], heart:[1], level:3, phrase:"to the park"},
    {w:"do", g:"d o", p:["d","oo"], heart:[1], level:3, phrase:"I can do it"},
    {w:"of", g:"o f", p:["u","v"], heart:[0,1], level:3, phrase:"a cup of milk"},
    {w:"is", g:"i s", p:["i","z"], heart:[1], level:3, phrase:"the sun is hot"},
    {w:"his", g:"h i s", p:["h","i","z"], heart:[2], level:3, phrase:"his hat"},
    {w:"has", g:"h a s", p:["h","a","z"], heart:[2], level:3, phrase:"the hen has a nest"},
    {w:"was", g:"w a s", p:["w","u","z"], heart:[1,2], level:3, phrase:"the dog was wet"},
    {w:"said", g:"s ai d", p:["s","e","d"], heart:[1], level:3, phrase:"the man said"},
    {w:"you", g:"y ou", p:["y","oo"], heart:[1], level:4, phrase:"you can do it"},
    {w:"they", g:"th ey", p:["th_v","ay"], heart:[0,1], level:4, phrase:"they can run"},
    {w:"we", g:"w e", p:["w","ee"], heart:[1], level:4, phrase:"we can sit"},
    {w:"me", g:"m e", p:["m","ee"], heart:[1], level:4, phrase:"help me"},
    {w:"be", g:"b e", p:["b","ee"], heart:[1], level:4, phrase:"be kind"},
    {w:"he", g:"h e", p:["h","ee"], heart:[1], level:4, phrase:"he can run"},
    {w:"she", g:"sh e", p:["sh","ee"], heart:[1], level:4, phrase:"she has a hat"},
    {w:"my", g:"m y", p:["m","ie"], heart:[1], level:4, phrase:"my red hat"},
    {w:"by", g:"b y", p:["b","ie"], heart:[1], level:4, phrase:"by the tree"},
    {w:"come", g:"c o m e", p:["k","u","m",""], heart:[1,3], level:5, phrase:"come and see"},
    {w:"some", g:"s o m e", p:["s","u","m",""], heart:[1,3], level:5, phrase:"some milk"},
    {w:"one", g:"o n e", p:["w","u","n"], heart:[0,2], level:5, phrase:"one sun"},
    {w:"two", g:"t wo", p:["t","oo"], heart:[1], level:5, phrase:"two bugs"},
    {w:"four", g:"f our", p:["f","or"], heart:[1], level:5, phrase:"four fish"},
    {w:"could", g:"c ou l d", p:["k","oo_short","","d"], heart:[1,3], level:5, phrase:"could you help"},
    {w:"would", g:"w ou l d", p:["w","oo_short","","d"], heart:[1,3], level:5, phrase:"would you come"},
    {w:"should", g:"sh ou l d", p:["sh","oo_short","","d"], heart:[1,3], level:5, phrase:"should we go"},
    {w:"who", g:"wh o", p:["h","oo"], heart:[0,1], level:5, phrase:"who is in the box"},
    {w:"what", g:"wh a t", p:["w","u","t"], heart:[0,1], level:5, phrase:"what is that"},
    {w:"where", g:"wh ere", p:["w","air"], heart:[1], level:6, phrase:"where is the cat"},
    {w:"there", g:"th ere", p:["th_v","air"], heart:[1], level:6, phrase:"the cat is there"},
    {w:"their", g:"th eir", p:["th_v","air"], heart:[1], level:6, phrase:"their dog"},
    {w:"here", g:"h ere", p:["h","ear"], heart:[1], level:6, phrase:"here is my hat"},
    {w:"are", g:"are", p:["ar"], heart:[0], level:6, phrase:"the bugs are wet"},
    {w:"have", g:"h a v e", p:["h","a","v",""], heart:[1,3], level:6, phrase:"I have a map"},
    {w:"give", g:"g i v e", p:["g","i","v",""], heart:[1,3], level:6, phrase:"give me the map"},
    {w:"love", g:"l o v e", p:["l","u","v",""], heart:[1,3], level:6, phrase:"I love my dog"},
    {w:"done", g:"d o n e", p:["d","u","n",""], heart:[1,3], level:6, phrase:"I am done"},
    {w:"gone", g:"g o n e", p:["g","aw","n",""], heart:[1,3], level:6, phrase:"the sun is gone"}
  ],

  sightWords: [
    "the","of","and","a","to","in","is","you","that","it","he","was","for","on","are","as","with","his","they","I","at","be","this","have","from",
    "or","one","had","by","words","but","not","what","all","were","we","when","your","can","said","there","use","an","each","which","she","do","how","their","if","word"
  ],

  sentences: [
    {level:2, text:"The cat sat on the mat.", q:"Who sat on the mat?", options:[["\u{1F431}","cat"],["\u{1F436}","dog"],["\u{1F41B}","bug"]], answer:0},
    {level:2, text:"A bug is in the mud.", q:"What is in the mud?", options:[["\u{1F41B}","bug"],["\u{1F98A}","fox"],["\u{1F414}","hen"]], answer:0},
    {level:2, text:"The dog can run.", q:"Who can run?", options:[["\u{1F436}","dog"],["\u{1F437}","pig"],["\u{1F41C}","ant"]], answer:0},
    {level:3, text:"The ship is at the dock.", q:"What is at the dock?", options:[["\u{1F6A2}","ship"],["\u{1F41F}","fish"],["\u{1F41A}","shell"]], answer:0},
    {level:3, text:"The fox is in the box.", q:"Where is the fox?", options:[["\u{1F4E6}","box"],["\u{1F6C1}","bath"],["\u{1F48D}","ring"]], answer:0},
    {level:3, text:"The king has a ring.", q:"What does the king have?", options:[["\u{1F48D}","ring"],["\u{1FAB6}","wing"],["\u{1F3B5}","song"]], answer:0},
    {level:4, text:"The frog jumps in the pond.", q:"Who jumps?", options:[["\u{1F438}","frog"],["\u{1F980}","crab"],["\u{1F941}","drum"]], answer:0},
    {level:4, text:"The crab is on the sand.", q:"Where is the crab?", options:[["\u{1F3D6}\uFE0F","sand"],["\u26FA","tent"],["\u{1FA91}","desk"]], answer:0},
    {level:4, text:"The lamp is on the desk.", q:"What is on the desk?", options:[["\u{1F4A1}","lamp"],["\u{1F95B}","milk"],["\u{1F381}","gift"]], answer:0},
    {level:5, text:"The goat eats the green grass.", q:"What does the goat eat?", options:[["\u{1F33F}","grass"],["\u{1F382}","cake"],["\u{1F33D}","corn"]], answer:0},
    {level:5, text:"The train goes to the farm.", q:"Where does the train go?", options:[["\u{1F69C}","farm"],["\u{1F319}","moon"],["\u{1F6E3}\uFE0F","road"]], answer:0},
    {level:5, text:"The bird sits in the tree.", q:"Where is the bird?", options:[["\u{1F333}","tree"],["\u26F5","boat"],["\u{1F3E0}","house"]], answer:0},
    {level:6, text:"The boy has a coin.", q:"What does the boy have?", options:[["\u{1FA99}","coin"],["\u{1F9F8}","toy"],["\u{1F967}","pie"]], answer:0},
    {level:6, text:"The owl sits in the tree at night.", q:"When does the owl sit?", options:[["\u{1F319}","night"],["\u2600\uFE0F","day"],["\u{1F327}\uFE0F","rain"]], answer:0},
    {level:6, text:"The mouse runs to the house.", q:"Where does the mouse run?", options:[["\u{1F3E0}","house"],["\u2601\uFE0F","cloud"],["\u{1FA91}","table"]], answer:0}
  ]
};
