import {
  createMetaMaskContext,
  withMetaMask,
} from "@tokenfoundry/react-metamask";

const MetaMaskContext = createMetaMaskContext();

export const withMetaMaskContext = withMetaMask(MetaMaskContext);

export default MetaMaskContext;
