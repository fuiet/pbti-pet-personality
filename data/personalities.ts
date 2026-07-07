export interface Personality {
  code: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  traits: string[];
  advice: string[];
}

export const personalities: Record<string, Personality> = {
  AEVP:{code:"AEVP",name:"Little Sunshine",title:"小太阳",emoji:"☀️",description:"A joyful pet who brings energy, happiness and endless interaction.",traits:["Playful","Social","Energetic"],advice:["Provide active play","Share joyful moments"]},
  AEVG:{code:"AEVG",name:"Wild Heart",title:"自由灵魂",emoji:"🔥",description:"A brave and curious companion who loves discovering new things.",traits:["Curious","Brave","Independent"],advice:["Offer exploration opportunities","Respect their personality"]},
  AECP:{code:"AECP",name:"Curious Dreamer",title:"好奇梦想家",emoji:"🎨",description:"A gentle explorer with a creative and thoughtful nature.",traits:["Curious","Gentle","Sensitive"],advice:["Use gentle games","Encourage discovery"]},
  AECG:{code:"AECG",name:"Gentle Guardian",title:"温柔守护者",emoji:"🌙",description:"Quiet outside, deeply connected inside. This pet shows love through trust and companionship.",traits:["Calm","Loyal","Sensitive"],advice:["Respect personal space","Keep routines stable"]},
  ASEP:{code:"ASEP",name:"Cozy Explorer",title:"舒适探险家",emoji:"🌱",description:"A careful explorer who enjoys safe adventures.",traits:["Careful","Curious","Balanced"],advice:["Create safe exploration areas"]},
  ASEG:{code:"ASEG",name:"Loyal Companion",title:"忠诚伙伴",emoji:"🛡️",description:"A dependable friend who values trust and stability.",traits:["Reliable","Loyal","Stable"],advice:["Maintain routines","Build trust"]},
  ASCP:{code:"ASCP",name:"Cozy Dreamer",title:"慵懒梦想家",emoji:"☁️",description:"A peaceful pet who enjoys comfort and quiet companionship.",traits:["Relaxed","Gentle"],advice:["Provide cozy spaces"]},
  ASCG:{code:"ASCG",name:"Peace Keeper",title:"和平守护者",emoji:"🕊️",description:"A calm soul who avoids conflict and values harmony.",traits:["Peaceful","Observant"],advice:["Keep environments calm"]},
  IEVP:{code:"IEVP",name:"Little Explorer",title:"小小探险家",emoji:"🧭",description:"Independent but curious, always ready for adventure.",traits:["Explorer","Active"],advice:["Offer new experiences"]},
  IEVG:{code:"IEVG",name:"Wild Spirit",title:"野性精灵",emoji:"🐯",description:"A free spirit with strong curiosity and confidence.",traits:["Bold","Independent"],advice:["Give freedom and challenges"]},
  IECP:{code:"IECP",name:"Quiet Thinker",title:"安静思考者",emoji:"🌌",description:"A thoughtful observer who enjoys understanding the world.",traits:["Smart","Quiet"],advice:["Allow observation time"]},
  IECG:{code:"IECG",name:"Silent King",title:"沉默王者",emoji:"👑",description:"A confident independent pet with a calm presence.",traits:["Confident","Calm"],advice:["Respect independence"]},
  ISEP:{code:"ISEP",name:"Curious Soul",title:"好奇灵魂",emoji:"🚀",description:"A curious pet who explores at their own pace.",traits:["Curious","Independent"],advice:["Encourage exploration"]},
  ISEG:{code:"ISEG",name:"Independent Guardian",title:"独立守护者",emoji:"🏰",description:"A strong and reliable personality who protects quietly.",traits:["Strong","Reliable"],advice:["Respect boundaries"]},
  ISCP:{code:"ISCP",name:"Calm Dreamer",title:"安静梦想家",emoji:"💤",description:"A relaxed pet who enjoys peaceful moments.",traits:["Calm","Gentle"],advice:["Create comfortable spaces"]},
  ISCG:{code:"ISCG",name:"Mystery Soul",title:"神秘灵魂",emoji:"🌑",description:"A unique personality with deep emotions and quiet confidence.",traits:["Mysterious","Observant"],advice:["Be patient and understanding"]}
};
