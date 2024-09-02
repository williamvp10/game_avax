import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const axelarNetworks: { [key: string]: any } = {
  "localhost": {
    "ethereum_Sepolia": {
      "chainId": 31337, // Chain ID for Hardhat localhost
      "axelarName": "ethereum-sepolia",
      "gatewayAddress": "0xe432150cce91c13a887f7D836923d5597adD8E31",
      "gasServiceAddress": "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    }
  },
  "testnet": {
    "ethereum_Sepolia": {
      "chainId": 11155111,
      "axelarName": "ethereum-sepolia",
      "gatewayAddress": "0xe432150cce91c13a887f7D836923d5597adD8E31",
      "gasServiceAddress": "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    },
    "avalanche_fuji": {
      "chainId": 43113,
      "axelarName": "Avalanche",
      "gatewayAddress": "0xC249632c2D40b9001FE907806902f63038B737Ab",
      "gasServiceAddress": "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    },
  }
};

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers, network } = hre;
  console.log("Deploying contracts with account:", deployer, network.name);
  const networkConfig = axelarNetworks[network.name];

  // Variables comunes
  const feePercentage = 2;
  const mapOwnerPercentage = 1;
  const communityPercentage = 2;
  const pointsPercentage = 35;
  const winnerPercentage = 60;
  const communityWallet = "0x97CBFB45b75F7bc7505bb642566cC96F50E67ffE";  // Dirección de la wallet de la comunidad

  let sepoliaDeployments: { [key: string]: string } = {};
  // Paso 1: Despliegue en localhost
  if (network.name === "localhost") {
    const { gatewayAddress, gasServiceAddress } = networkConfig["ethereum_Sepolia"];

    const initialSupply = 21000000;  // Suministro inicial
    const tokenDeployment = await deploy("CrossChainToken", {
      from: deployer,
      args: ["Sea of Fortune Battle", "SFB", initialSupply, deployer, gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const tokenAddress = tokenDeployment.address;
    console.log(`Token deployed at address: ${tokenAddress}`);

    const nftCollectionDeployment = await deploy("CrossChainNFTCollection", {
      from: deployer,
      args: ["Sea of Fortune Ship", "SFS", deployer, "https://ipfs.io/ipfs/QmP4CkvwLGjT8qJqCZzGjkS6bczBfbPLWTXwNsdtbTyCjR/{id}.json", gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const nftCollectionAddress = nftCollectionDeployment.address;
    console.log(`NFT Collection deployed at address: ${nftCollectionAddress}`);

    const seaFortuneDeployment = await deploy("SeaFortune", {
      from: deployer,
      args: [
        tokenAddress,
        communityWallet,
        feePercentage,
        mapOwnerPercentage,
        communityPercentage,
        pointsPercentage,
        winnerPercentage,
        gatewayAddress,
        gasServiceAddress,
      ],
      log: true,
      autoMine: true,
    });

    const seaFortuneAddress = seaFortuneDeployment.address;
    console.log("SeaFortune deployed at:", seaFortuneAddress);
    
    return; // No se necesita configuración cross-chain para localhost
  }

  // Paso 2: Despliegue en Sepolia
  if (network.name === "ethereum_Sepolia") {
    const { gatewayAddress, gasServiceAddress } = networkConfig["ethereum_Sepolia"];

    const initialSupply = 21000000;  // Suministro inicial
    const tokenDeployment = await deploy("CrossChainToken", {
      from: deployer,
      args: ["Sea of Fortune Battle", "SFB", initialSupply, deployer, gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const tokenAddress = tokenDeployment.address;
    console.log(`Token deployed at address: ${tokenAddress}`);

    const nftCollectionDeployment = await deploy("CrossChainNFTCollection", {
      from: deployer,
      args: ["Sea of Fortune Ship", "SFS", deployer, "https://metadata-uri.com/", gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const nftCollectionAddress = nftCollectionDeployment.address;
    console.log(`NFT Collection deployed at address: ${nftCollectionAddress}`);

    const seaFortuneDeployment = await deploy("SeaFortune", {
      from: deployer,
      args: [
        tokenAddress,
        communityWallet,
        feePercentage,
        mapOwnerPercentage,
        communityPercentage,
        pointsPercentage,
        winnerPercentage,
        gatewayAddress,
        gasServiceAddress,
      ],
      log: true,
      autoMine: true,
    });

    const seaFortuneAddress = seaFortuneDeployment.address;
    console.log("SeaFortune deployed at:", seaFortuneAddress);

    // Guardar las direcciones desplegadas en Sepolia para configurarlas después
    sepoliaDeployments = {
      tokenAddress,
      nftCollectionAddress,
      seaFortuneAddress
    };
  }

  // Paso 2: Despliegue en Avalanche Fuji
  if (network.name === "avalanche_fuji") {
    const { gatewayAddress, gasServiceAddress } = networkConfig["avalanche_fuji"];

    const initialSupply = 10;  // Suministro inicial
    const tokenDeployment = await deploy("CrossChainToken", {
      from: deployer,
      args: ["Sea of Fortune Battle", "SFB", initialSupply, deployer, gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const tokenAddress = tokenDeployment.address;
    console.log(`Token deployed at address: ${tokenAddress}`);

    const nftCollectionDeployment = await deploy("CrossChainNFTCollection", {
      from: deployer,
      args: ["Sea of Fortune Ship", "SFS", deployer, "https://metadata-uri.com/", gatewayAddress, gasServiceAddress],
      log: true,
      autoMine: true,
    });

    const nftCollectionAddress = nftCollectionDeployment.address;
    console.log(`NFT Collection deployed at address: ${nftCollectionAddress}`);

    const seaFortuneDeployment = await deploy("SeaFortune", {
      from: deployer,
      args: [
        tokenAddress,
        communityWallet,
        feePercentage,
        mapOwnerPercentage,
        communityPercentage,
        pointsPercentage,
        winnerPercentage,
        gatewayAddress,
        gasServiceAddress,
      ],
      log: true,
      autoMine: true,
    });

    const seaFortuneAddress = seaFortuneDeployment.address;
    console.log("SeaFortune deployed at:", seaFortuneAddress);

    // Configurar direcciones de confianza para contratos en Avalanche Fuji y Sepolia
    const crossChainNFTCollection = await ethers.getContract<Contract>("CrossChainNFTCollection", deployer);
    await crossChainNFTCollection.setTrustedRemote(networkConfig["ethereum_Sepolia"].axelarName, sepoliaDeployments.nftCollectionAddress);
    await crossChainNFTCollection.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, nftCollectionAddress);
    console.log("Trusted remotes set for CrossChainNFTCollection on Avalanche Fuji");

    const seaFortune = await ethers.getContract<Contract>("SeaFortune", deployer);
    await seaFortune.setTrustedRemote(networkConfig["ethereum_Sepolia"].axelarName, sepoliaDeployments.seaFortuneAddress);
    await seaFortune.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, seaFortuneAddress);
    console.log("Trusted remotes set for SeaFortune on Avalanche Fuji");

    // Configurar el crossChainToken
    const crossChainToken = await ethers.getContract<Contract>("CrossChainToken", deployer);
    await crossChainToken.setTrustedRemote(networkConfig["ethereum_Sepolia"].axelarName, sepoliaDeployments.tokenAddress);
    await crossChainToken.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, tokenAddress);
    console.log("Trusted remote set for CrossChainToken on Avalanche Fuji");

  }

  // Paso 3: Configurar Sepolia después de Avalanche
  if (network.name === "ethereum_Sepolia") {
    const crossChainNFTCollection = await ethers.getContract<Contract>("CrossChainNFTCollection", deployer);
    await crossChainNFTCollection.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, sepoliaDeployments.nftCollectionAddress);
    console.log("Trusted remote set for CrossChainNFTCollection on Sepolia");

    const seaFortune = await ethers.getContract<Contract>("SeaFortune", deployer);
    await seaFortune.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, sepoliaDeployments.seaFortuneAddress);
    console.log("Trusted remote set for SeaFortune on Sepolia");

    // Configurar el crossChainToken
    const crossChainToken = await ethers.getContract<Contract>("CrossChainToken", deployer);
    await crossChainToken.setTrustedRemote(networkConfig["avalanche_fuji"].axelarName, sepoliaDeployments.tokenAddress);
    console.log("Trusted remote set for CrossChainToken on Sepolia");

  }
};

export default deployContracts;

deployContracts.tags = ["CrossChainToken", "CrossChainNFTCollection", "SeaFortune"];
