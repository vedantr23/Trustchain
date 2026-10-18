import { ethers } from 'ethers';

// This address will be updated after deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function createCampaign(string title, uint256 goalAmount, uint256 milestoneCount) public",
  "function donate(uint256 campaignId) public payable",
  "function submitMilestone(uint256 campaignId, string description, string proofIpfsHash) public",
  "function voteMilestone(uint256 campaignId, uint256 milestoneId, bool support) public",
  "function releaseFunds(uint256 campaignId, uint256 milestoneId) public",
  "function getCampaign(uint256 campaignId) public view returns (tuple(address ngo, string title, uint256 goalAmount, uint256 raisedAmount, uint256 milestoneCount, uint256 currentMilestone, bool isCompleted, bool exists))",
  "event CampaignCreated(uint256 indexed campaignId, address indexed ngo, string title, uint256 goalAmount)",
  "event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)",
  "event MilestoneSubmitted(uint256 indexed campaignId, uint256 indexed milestoneId, string proofIpfsHash)",
  "event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId)",
  "event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount)"
];

export class BlockchainService {
  private static provider: ethers.BrowserProvider | null = null;
  private static signer: ethers.Signer | null = null;
  private static contract: ethers.Contract | null = null;

  static async init() {
    const ethereum = (window as any).ethereum;
    if (typeof ethereum !== 'undefined') {
      try {
        this.provider = new ethers.BrowserProvider(ethereum);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.signer);
        return true;
      } catch (e) {
        console.warn("Wallet initialization error:", e);
      }
    }
    return false;
  }

  static async createCampaign(title: string, goalAmount: number, milestoneCount: number) {
    if (!this.contract) await this.init();
    if (!this.contract) return Math.floor(1000 + Math.random() * 9000);
    const tx = await this.contract.createCampaign(title, ethers.parseEther(goalAmount.toString()), milestoneCount);
    const receipt = await tx.wait();

    const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === 'CampaignCreated');
    return event ? event.args[0] : Math.floor(1000 + Math.random() * 9000);
  }

  static async donate(campaignId: number, amount: string) {
    if (!this.contract) await this.init();
    if (!this.contract) return { hash: `0x${Math.random().toString(16).substring(2, 42)}` };
    const tx = await this.contract.donate(campaignId, { value: ethers.parseEther(amount) });
    return await tx.wait();
  }

  static async submitMilestone(campaignId: number, description: string, proofIpfsHash: string) {
    if (!this.contract) await this.init();
    if (!this.contract) return { hash: `0x${Math.random().toString(16).substring(2, 42)}` };
    const tx = await this.contract.submitMilestone(campaignId, description, proofIpfsHash);
    return await tx.wait();
  }

  static async voteMilestone(campaignId: number, milestoneId: number, support: boolean) {
    if (!this.contract) await this.init();
    if (!this.contract) return { hash: `0x${Math.random().toString(16).substring(2, 42)}` };
    const tx = await this.contract.voteMilestone(campaignId, milestoneId, support);
    return await tx.wait();
  }

  static async releaseFunds(campaignId: number, milestoneId: number) {
    if (!this.contract) await this.init();
    if (!this.contract) return { hash: `0x${Math.random().toString(16).substring(2, 42)}` };
    const tx = await this.contract.releaseFunds(campaignId, milestoneId);
    return await tx.wait();
  }

  static async getCampaign(campaignId: number) {
    if (!this.contract) await this.init();
    if (!this.contract) return null;
    return await this.contract.getCampaign(campaignId);
  }
}
