(()=>{
const data=window.SEARCH003_DATA;
if(!data)return;

const accountCopy={
  SMP001:{name:'Streamer W',followersLabel:'133K',membersLabel:'approx. 540–544',size:'100K–300K',orgLabel:'Guild / club / back-office system',monetization:'Membership, gifts, player-carry services, AQ ordering system',acquisition:'Short video / livestream → Xiaowo group → focal/private contact → AQ club → admin → order group'},
  SMP003:{name:'Know the Jungle-Core Gap',followersLabel:'661K',membersLabel:'83',size:'300K–1M',orgLabel:'Individual brand + platform membership',monetization:'680/980 membership tiers, livestreams, group chat',acquisition:'Profile / livestream → membership / group chat'},
  SMP004:{name:'Honor of Kings · Moluo',followersLabel:'2.085M',membersLabel:'40',size:'1M+',orgLabel:'Offline studio',monetization:'Rank services, membership, commercial deals',acquisition:'Douyin profile → studio WeChat'},
  SMP005:{name:'Honor of Kings · Youhen',followersLabel:'4.229M',membersLabel:'Not recorded',size:'1M+',orgLabel:'Studio + multiple business entry points',monetization:'Hourly packages, carry services, commercial deals, group chat',acquisition:'Profile → multiple WeChat entry points'},
  SMP006:{name:'Honor of Kings · Lai Shen',followersLabel:'8.634M',membersLabel:'Not recorded',size:'1M+',orgLabel:'Customer service + club + back office',monetization:'Rank boosting, carry services, merchandise, commercial deals',acquisition:'Profile → customer service / carry-service wall / club'},
  SMP007:{name:'Honor of Kings · Sangjie',followersLabel:'6.159M',membersLabel:'Not recorded',size:'1M+',orgLabel:'Studio + team',monetization:'Hourly packages, companion/carry services, team services',acquisition:'Profile → studio / team'},
  SMP008:{name:'Honor of Kings · Liuwei',followersLabel:'2.013M',membersLabel:'Not recorded',size:'1M+',orgLabel:'Studio + community',monetization:'VIP groups, merchandise, commercial deals',acquisition:'Profile → studio / VIP group'},
  SMP009:{name:'Li Zhien · Honor of Kings',followersLabel:'1.507M',membersLabel:'2,157',size:'1M+',orgLabel:'Commercial contact + club',monetization:'Membership, merchandise, commercial deals, club',acquisition:'Posts / profile → membership / commercial contact / club'},
  SMP010:{name:'Honor of Kings · Lin Qi',followersLabel:'47K',membersLabel:'127',size:'10K–50K',orgLabel:'Lightweight individual operation',monetization:'Membership, group chat, individual commercial deals',acquisition:'Profile → individual business contact / group chat'},
  SMP011:{name:'Aoao Zhuge',followersLabel:'71K',membersLabel:'Not recorded',size:'50K–100K',orgLabel:'Guild / voice-acting system',monetization:'Auditions, recruitment, voice actor / CV work',acquisition:'Profile → audition / guild entry'},
  SMP012:{name:'Aoao Voice Acting Hall 9',followersLabel:'50K',membersLabel:'Not recorded',size:'50K–100K',orgLabel:'Voice-acting room / guild',monetization:'Streamer auditions, voice-actor auditions',acquisition:'Profile → voice-acting-room organization'},
  SMP013:{name:'Xintai · No. 1 Han Xin in China',followersLabel:'994K',membersLabel:'319',size:'300K–1M',orgLabel:'MCN + studio',monetization:'Rank boosting, companion/carry services, merchandise, membership',acquisition:'Profile → companion/carry service → Huiwan Studio'},
  SMP014:{name:'Xiang Ma',followersLabel:'394K',membersLabel:'11',size:'300K–1M',orgLabel:'Offline studio + MCN',monetization:'Peak-rank title service, offline studio, merchandise',acquisition:'Profile → studio / services'},
  SMP015:{name:'Hui-chan · Gentle Streamer',followersLabel:'129K',membersLabel:'321',size:'100K–300K',orgLabel:'Lightweight individual companion-service operation',monetization:'Gaming companionship, membership, group chat',acquisition:'Profile → personal WeChat / membership'},
  SMP016:{name:'Yuwen Nuo',followersLabel:'85K',membersLabel:'Not recorded',size:'50K–100K',orgLabel:'Individual technical operation',monetization:'Account maintenance / gameplay review, group chat',acquisition:'Profile → direct contact'},
  SMP017:{name:'A Mu',followersLabel:'44K',membersLabel:'3,380',size:'10K–50K',orgLabel:'Individual knowledge / coaching membership business',monetization:'Membership, rank boosting, 1v1 coaching, strategy documents',acquisition:'Profile → membership / 1v1 / strategy'},
  SMP018:{name:'Honor of Kings · Yi…',followersLabel:'Unknown',membersLabel:'Unknown',size:'Micro livestream',orgLabel:'Unknown back office',monetization:'2-carry-3, 20 matches, star-ranking service',acquisition:'Livestream → on-the-spot invitation'},
  SMP019:{name:'Changhen',followersLabel:'3,646',membersLabel:'34',size:'<10K',orgLabel:'Embedded micro-guild',monetization:'Membership, fan-level incentives',acquisition:'Profile → guild / membership / group chat'}
};

data.accounts.forEach(account=>Object.assign(account,accountCopy[account.id]||{}));

const featureLabels={member:'Membership',group:'Group chat / community',private:'Private-channel diversion',org:'Organizational back office',direct:'Direct service',business:'Merchandise / commercial deals'};
(data.features||[]).forEach(feature=>{if(featureLabels[feature.key])feature.label=featureLabels[feature.key]});

const sizeLabels={'<1万':'<10K','1–5万':'10K–50K','5–10万':'50K–100K','10–30万':'100K–300K','30–100万':'300K–1M','100万+':'1M+','微型直播间':'Micro livestream'};
(data.orgBySize||[]).forEach(row=>{row.size=sizeLabels[row.size]||row.size});
data.orgLabels={personal:'Lightweight individual',studio:'Studio',club:'Guild / club / back office',hybrid:'Studio + MCN',unknown:'Unknown'};

const pricingCopy={
  '1个月会员':'1-month membership',
  '3个月会员':'3-month membership',
  '12个月会员':'12-month membership',
  '亲吻':'Kiss',
  '比心兔兔':'Heart-gesture Bunny',
  '跑车':'Sports Car'
};
(data.pricing||[]).forEach(item=>{
  item.type=item.type==='会员'?'Membership':item.type==='礼物'?'Gift':item.type;
  item.item=pricingCopy[item.item]||item.item;
});

const timelineCopy={
  EP001:{label:'Sustained verbal abuse toward teammates',time:'approx. 00:50–04:12',detail:'For several minutes, the streamer repeatedly denigrates teammates, including death-directed online abuse, competence humiliation, and animal comparisons.'},
  EP002:{label:'Gift appears → tone switches',time:'approx. 04:13–04:27',detail:'After a viewer sends the “Cloud Realm” gift, the streamer quickly shifts to a softer thank-you register, uses an affectionate nickname, and repeats the thanks.'},
  EP003:{label:'Moderator / ordinary-viewer defense',time:'around 21:50, 28 Aug 2026',detail:'A moderator tells the critic that the streamer chooses whom to carry; ordinary viewers also attack the critic, and a moderator subsequently removes the user.'}
};
(data.timeline||[]).forEach(item=>Object.assign(item,timelineCopy[item.id]||{}));

const pathCopy={
  P001:{title:'Identification → private channel → order',stages:['Short video / livestream creates identification','Xiaowo group','Streamer / official WeChat','AQ admin','Order group'],accounts:['Streamer W']},
  P002:{title:'Technical credibility → studio → service',stages:['Technical content / profile track record','Personal WeChat / studio','Rank-title / rank-boost / carry / hourly service'],accounts:['Moluo','Youhen','Xintai','Sangjie']},
  P003:{title:'Persona label → membership / private channel',stages:['Streamer persona / recognizable label','Membership / fan group','Private contact / paid interaction'],accounts:['Know the Jungle-Core Gap','Hui-chan · Gentle Streamer','Changhen']},
  P004:{title:'Teaching content → membership / 1v1',stages:['Teaching / strategy content','Membership / 1v1 entry','Strategy documents / rank-up / 1v1'],accounts:['A Mu']},
  P005:{title:'Voice identity → audition / guild',stages:['Voice / dubbing identity','Audition / guild / voice-acting hall','CV / streamer / voice-actor roles'],accounts:['Aoao Zhuge','Voice Acting Hall 9']},
  P006:{title:'Micro streamer → guild / membership',stages:['Micro-streamer profile','Guild / membership / group chat','Level incentives / long-term community'],accounts:['Changhen']},
  P007:{title:'Livestream instant sale',stages:['Live-room sales pitch','Immediate invitation','Two-carry-three / star-ranking / match packages'],accounts:['Honor of Kings · Yi…']}
};
(data.paths||[]).forEach(path=>Object.assign(path,pathCopy[path.id]||{}));
})();
