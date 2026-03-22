export type SpeakerType = 'presentation' | 'lightning' | 'panel' | 'workshop';

export interface Speaker {
  handle: string;
  speakerType: SpeakerType;
}

export interface SideEvent {
  slug: string;
  name: string;
  dates: string;
  smokesignalUrl?: string;
  speakers: Speaker[];
}

export interface EventConfig {
  slug: string;
  name: string;
  dates: string;
  location: string;
  url: string;
  smokesignalUrl: string;
  speakers: Speaker[];
  sideEvents: SideEvent[];
}

export const SPEAKER_TYPE_LABELS: Record<SpeakerType, string> = {
  presentation: 'Speaker',
  lightning: 'Lightning Talk',
  panel: 'Panelist',
  workshop: 'Workshop Lead',
};

export const event: EventConfig = {
  slug: 'atmosphereconf-2026',
  name: 'ATmosphereConf 2026',
  dates: 'March 26\u201329, 2026',
  location: 'Vancouver, BC',
  url: 'https://atmosphereconf.org',
  smokesignalUrl: 'https://smokesignal.events/did:plc:lehcqqkwzcwvjvw66uthu5oq/3lte3c7x43l2e',
  speakers: [
    // Presentations (55)
    { handle: 'brittanyellich.com', speakerType: 'presentation' },
    { handle: 'knotbin.com', speakerType: 'presentation' },
    { handle: 'nonbinary.computer', speakerType: 'presentation' },
    { handle: 'signez.fr', speakerType: 'presentation' },
    { handle: 'jonathanwarden.com', speakerType: 'presentation' },
    { handle: 'gov.glados.computer', speakerType: 'presentation' },
    { handle: 'tylerjfisher.com', speakerType: 'presentation' },
    { handle: 'offline.arushibandi.com', speakerType: 'presentation' },
    { handle: 'hilk.eu', speakerType: 'presentation' },
    { handle: 'hailey.at', speakerType: 'presentation' },
    { handle: 'goat.navy', speakerType: 'presentation' },
    { handle: 'pfrazee.com', speakerType: 'presentation' },
    { handle: 'dholms.at', speakerType: 'presentation' },
    { handle: 'chipnick.com', speakerType: 'presentation' },
    { handle: 'jimray.bsky.team', speakerType: 'presentation' },
    { handle: 'joe.germuska.com', speakerType: 'presentation' },
    { handle: 'werd.io', speakerType: 'presentation' },
    { handle: 'case.bsky.social', speakerType: 'presentation' },
    { handle: 'seabass.bsky.social', speakerType: 'presentation' },
    { handle: 'devingaffney.com', speakerType: 'presentation' },
    { handle: 'maxine.science', speakerType: 'presentation' },
    { handle: 'rude1.blacksky.team', speakerType: 'presentation' },
    { handle: 'emily.gorcen.ski', speakerType: 'presentation' },
    { handle: 'baldemo.to', speakerType: 'presentation' },
    { handle: 'tessa.germnetwork.com', speakerType: 'presentation' },
    { handle: 'kobi.bsky.social', speakerType: 'presentation' },
    { handle: 'drkalyn.blacksky.team', speakerType: 'presentation' },
    { handle: 'scoiattolo.mountainherder.xyz', speakerType: 'presentation' },
    { handle: 'holke.xyz', speakerType: 'presentation' },
    { handle: 'meri.garden', speakerType: 'presentation' },
    { handle: 'laurenshof.online', speakerType: 'presentation' },
    { handle: 'cassidyjames.com', speakerType: 'presentation' },
    { handle: 'blaine.bsky.social', speakerType: 'presentation' },
    { handle: 'iame.li', speakerType: 'presentation' },
    { handle: 'eclecticcapital.bsky.social', speakerType: 'presentation' },
    { handle: 'mk.gg', speakerType: 'presentation' },
    { handle: 'dame.is', speakerType: 'presentation' },
    { handle: 'aendra.com', speakerType: 'presentation' },
    { handle: 'sandrabarthel.bsky.social', speakerType: 'presentation' },
    { handle: 'bad-example.com', speakerType: 'presentation' },
    { handle: 'cypherhippie.bsky.social', speakerType: 'presentation' },
    { handle: 'jon2600.bsky.social', speakerType: 'presentation' },
    { handle: 'trezy.codes', speakerType: 'presentation' },
    { handle: 'chadfowler.com', speakerType: 'presentation' },
    { handle: 'cameron.stream', speakerType: 'presentation' },
    { handle: 'ivansigal.bsky.social', speakerType: 'presentation' },
    { handle: 'leijiew.bsky.social', speakerType: 'presentation' },
    { handle: 'linguangst.bsky.social', speakerType: 'presentation' },
    { handle: 'danabra.mov', speakerType: 'presentation' },
    { handle: 'mosh.bsky.social', speakerType: 'presentation' },
    { handle: 'kissane.myatproto.social', speakerType: 'presentation' },
    { handle: 'bankonjustin.bsky.social', speakerType: 'presentation' },
    { handle: 'zeu.dev', speakerType: 'presentation' },
    { handle: 'anirudh.fi', speakerType: 'presentation' },
    { handle: 'patak.cat', speakerType: 'presentation' },
    // Lightning talks (21)
    { handle: 'quillmatiq.com', speakerType: 'lightning' },
    { handle: 'immber.bsky.social', speakerType: 'lightning' },
    { handle: 'rangakrishnan1.bsky.social', speakerType: 'lightning' },
    { handle: 'nickthesick.com', speakerType: 'lightning' },
    { handle: 'raedisch.net', speakerType: 'lightning' },
    { handle: 'tynanpurdy.com', speakerType: 'lightning' },
    { handle: 'chadtmiller.com', speakerType: 'lightning' },
    { handle: 'calabro.io', speakerType: 'lightning' },
    { handle: 'timburks.me', speakerType: 'lightning' },
    { handle: 'timryan.org', speakerType: 'lightning' },
    { handle: 'hypha.coop', speakerType: 'lightning' },
    { handle: 'buildwithtori.com', speakerType: 'lightning' },
    { handle: 'stephanjnoel.bsky.social', speakerType: 'lightning' },
    { handle: 'sarava.net', speakerType: 'lightning' },
    { handle: 'pop.pe', speakerType: 'lightning' },
    { handle: 'billwpierce.co', speakerType: 'lightning' },
    { handle: 'jennie-gander.bsky.social', speakerType: 'lightning' },
    { handle: 'mmccue.bsky.social', speakerType: 'lightning' },
    { handle: 'robin.berjon.com', speakerType: 'lightning' },
    { handle: 'psyverson.bsky.social', speakerType: 'lightning' },
    { handle: 'ronentk.me', speakerType: 'lightning' },
    // Panels (7)
    { handle: 'vicwalker.dev.br', speakerType: 'panel' },
    { handle: 'joebasser.com', speakerType: 'panel' },
    { handle: 'darrin.bsky.team', speakerType: 'panel' },
    { handle: 'matt.bsky.team', speakerType: 'panel' },
    { handle: 'komorama.bsky.social', speakerType: 'panel' },
    { handle: 'masnick.com', speakerType: 'panel' },
    { handle: 'eliot.sh', speakerType: 'panel' },
    // Workshops (9)
    { handle: 'ngerakines.me', speakerType: 'workshop' },
    { handle: 'dcwalker.ca', speakerType: 'workshop' },
    { handle: 'janlindblad.bsky.social', speakerType: 'workshop' },
    { handle: 'christian.bsky.social', speakerType: 'workshop' },
    { handle: 'alex.bsky.team', speakerType: 'workshop' },
    { handle: 'newpublic.org', speakerType: 'workshop' },
    { handle: 'schlage.town', speakerType: 'workshop' },
    { handle: 'baileytownsend.dev', speakerType: 'workshop' },
  ],
  sideEvents: [
    {
      slug: 'atscience',
      name: 'ATScience 2026',
      dates: 'March 27, 2026',
      smokesignalUrl: 'https://smokesignal.events/did:plc:nncebyouba4ex3775syiyvjy/3mfscvdtbb2ql',
      speakers: [],
    },
  ],
};
