import {
  ThirdwebNftMedia,
  useAddress,
  useChainId,
  useContract,
  useMetamask,
  useNFTs,
  ConnectWallet,
} from "@thirdweb-dev/react";
import { GelatoRelay, CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { Bytes, BytesLike, ethers } from "ethers";
import ReviewTokenABI from "../assets/abi/ReviewToken.json";

import styles from "../styles/Home.module.css";
import Image from "next/image";
import { NextPage } from "next";

import { useState, useEffect } from "react";

const Home: NextPage = () => {
  const target = "0xb241B676818bd9EF4AFdb3Bc246c429aA3DF4dd1";
  const address = useAddress();
  const chainId = useChainId();
  const { contract } = useContract(target, ReviewTokenABI.abi);
  const relay = new GelatoRelay();
  const gelatoAPI = "IeTEZaCSVQtOSQbBCnQV8JxGBJiOgH_X_bMGwOJw5uY_";

  // const { data: nfts, isLoading: loading } = useNFTs(contract, {
  //   start: 0,
  //   count: 10,
  // });


  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const ownerResult = await contract?.call("owner", []);
        setOwner(ownerResult);
      } catch (error) {
        console.error("Error fetching owner:", error);
      }
    };

    fetchOwner();
  }, [contract]);

  // console.log(contract?.call("owner", []));

  const truncateAddress = (address: string) => {
    return (
      address.substring(0, 6) + "..." + address.substring(address.length - 4)
    );
  };

  const sendRelayRequest = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    const user = await signer.getAddress();

    const g_contract = new ethers.Contract(target, ReviewTokenABI.abi, signer);
    const { data } = await g_contract.populateTransaction.owner();

    console.log(chainId);

    const request: CallWithERC2771Request = {
      chainId: chainId,
      target: target,
      data: data as BytesLike,
      user: user
    };
    const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoAPI);
    console.log(relayResponse);
  };

  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  const submitReview = async () => {
  };


  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome to{" "}
            <span className={styles.gradientText0}>
              My Actually Awesome App
            </span>
          </h1>

          <div>
            <h2>Reviews</h2>
            <iframe width="100%" id="tokenerc721_inventory_pageiframe" src="https://etherscan.io/token/0xf4ecc1c74d120649f6598c7a217abaffdf76cd4f#inventory" scrolling="yes"></iframe>
          </div>

          <div>
            <h2>Features!</h2>
            <div className={styles.connect}>
              <ConnectWallet />
            </div>
            <button id="relayRequest" onClick={sendRelayRequest}>
              Use Some Feature
            </button>


            <div className="review-box">
              <h2>Write a Review</h2>
              <label htmlFor="review">
                Rating:
                <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                  <option value={0}>1</option>
                  <option value={1}>2</option>
                  <option value={2}>3</option>
                  <option value={3}>4</option>
                  <option value={4}>5</option>
                  <option value={5}>6</option>
                  <option value={6}>7</option>
                  <option value={7}>8</option>
                  <option value={8}>9</option>
                  <option value={9}>10</option>
                </select>
              </label>
              <label htmlFor="reviewText">
                Review:
                <textarea id="reviewText" value={review} onChange={(e) => setReview(e.target.value)} />
              </label>
              <button onClick={submitReview}>Submit Review</button>
            </div>

            {owner === address ? (
              <div>
                <h2>Admin Settings</h2>
                <div>
                  <p> setting 1 </p>
                </div>
              </div>
            ) : (
              <h2>Contract owner is {owner}. If you are the contract owner, switch account to manage admin settings.</h2>
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
