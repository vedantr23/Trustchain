/**
 * Pinata IPFS Service
 * Uploads media to Pinata and builds working gateway URLs for admin preview.
 */

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = (import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs').replace(/\/$/, '');

export const PINATA_GATEWAYS = [
  PINATA_GATEWAY,
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs',
].filter((url, i, arr) => arr.indexOf(url) === i);

export interface PinataUploadResult {
  ipfsHash: string;
  pinataUrl: string;
  isMock: boolean;
}

export class PinataService {
  static extractCid(hashOrUrl?: string | null): string {
    if (!hashOrUrl) return '';
    const value = hashOrUrl.trim();
    if (!value || value.startsWith('data:') || value === 'pending') return '';
    const ipfsProto = value.match(/^ipfs:\/\/(.+)$/i);
    if (ipfsProto) return ipfsProto[1].split('/')[0];
    const pathMatch = value.match(/\/ipfs\/([^/?#]+)/i);
    if (pathMatch) return pathMatch[1];
    if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]+|bafk[a-z0-9]+)/i.test(value) && !value.includes('://')) {
      return value;
    }
    return '';
  }

  static getGatewayUrl(ipfsHash: string, gatewayIndex: number = 0): string {
    const cid = PinataService.extractCid(ipfsHash) || ipfsHash;
    const gateway = PINATA_GATEWAYS[gatewayIndex % PINATA_GATEWAYS.length];
    return `${gateway}/${cid}`;
  }

  static getPreviewUrls(hashOrUrl?: string | null, extra?: string | null): string[] {
    const urls: string[] = [];
    const cid = PinataService.extractCid(hashOrUrl) || PinataService.extractCid(extra);
    if (cid) {
      PINATA_GATEWAYS.forEach((_, i) => urls.push(PinataService.getGatewayUrl(cid, i)));
    }
    if (hashOrUrl && hashOrUrl.startsWith('http')) urls.push(hashOrUrl);
    if (extra && extra.startsWith('http')) urls.push(extra);
    if (hashOrUrl && hashOrUrl.startsWith('data:')) urls.unshift(hashOrUrl);
    if (extra && extra.startsWith('data:')) urls.unshift(extra);
    return [...new Set(urls.filter(Boolean))];
  }

  static async uploadFile(file: File, customName?: string): Promise<PinataUploadResult> {
    if (!PINATA_JWT || PINATA_JWT.trim() === '') {
      throw new Error('Pinata JWT missing. Add VITE_PINATA_JWT in frontend/web/.env and restart the dev server.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({
      name: customName || file.name,
      keyvalues: {
        app: 'Trustchain',
        uploadedAt: new Date().toISOString(),
      }
    }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Pinata upload failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const ipfsHash = data.IpfsHash;
    if (!ipfsHash) throw new Error('Pinata did not return an IpfsHash.');

    return {
      ipfsHash,
      pinataUrl: PinataService.getGatewayUrl(ipfsHash),
      isMock: false,
    };
  }

  static async uploadJSON(jsonData: Record<string, any>, name: string): Promise<PinataUploadResult> {
    if (!PINATA_JWT || PINATA_JWT.trim() === '') {
      throw new Error('Pinata JWT missing. Add VITE_PINATA_JWT in frontend/web/.env and restart the dev server.');
    }

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataMetadata: { name },
        pinataContent: jsonData,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Pinata JSON upload failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return {
      ipfsHash: data.IpfsHash,
      pinataUrl: PinataService.getGatewayUrl(data.IpfsHash),
      isMock: false,
    };
  }
}
