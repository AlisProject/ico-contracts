export default function alis(n) {
  // ALIS token has same decimals of ether.
  // So we can use same digit such as `wei`.
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}
