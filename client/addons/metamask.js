import { createMetaMaskContext, withMetaMask } from "@daisypayments/react-metamask";

const MetaMaskContext = createMetaMaskContext();

export const withMetaMaskContext = withMetaMask(MetaMaskContext);

export default MetaMaskContext;
