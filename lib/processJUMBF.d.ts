export interface JumdContent {
  label: string;
  toggles: number;
  uuid: string;
  uuidString: string;
}

export interface JumbfBoxBase {
  id: number;
  location: {
    byteOffset: number;
    byteLength: number;
  };
}

export interface JumbfBoxJumd extends JumbfBoxBase {
  type: 'jumd';
  content: JumdContent;
}

export interface JumbfBoxJumb extends JumbfBoxBase {
  type: 'jumb';
  content: JumbfBox[];
}

export interface JumbfBoxCbor extends JumbfBoxBase {
  type: 'cbor';
  content: any;
}

export type JumbfBox = JumbfBoxJumd | JumbfBoxJumb | JumbfBoxCbor;

export function processJUMBF(jumbf: Uint8Array): JumbfBox[];
