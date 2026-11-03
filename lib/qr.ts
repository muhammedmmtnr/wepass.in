import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    color: {
      dark: '#035831', // WePass dark green brand color
      light: '#FFFFFF',
    },
  });
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#035831',
      light: '#FFFFFF',
    },
  });
}
