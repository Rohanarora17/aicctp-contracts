import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import * as fs from 'fs';
import * as path from 'path';

// Network configuration
const NETWORK = Network.TESTNET;
const config = new AptosConfig({ network: NETWORK });
const aptos = new Aptos(config);

async function deployContract() {
  console.log('🚀 Starting AI YieldNet Vault deployment...\n');

  // Create or load deployer account
  let deployerAccount: Account;
  
  // For demo purposes, create a new account
  // In production, you would load from a secure key file
  deployerAccount = Account.generate();
  
  console.log(`📝 Deployer Address: ${deployerAccount.accountAddress}`);
  console.log(`🔑 Private Key: ${deployerAccount.privateKey}`);
  console.log('\n⚠️  Save these credentials securely!\n');

  try {
    // Fund the account (testnet only)
    console.log('💰 Funding deployer account...');
    await aptos.fundAccount({
      accountAddress: deployerAccount.accountAddress,
      amount: 100_000_000, // 1 APT
    });
    console.log('✅ Account funded successfully\n');

    // Deploy the contract
    console.log('📦 Deploying contract...');
    
    // Read the compiled Move package
    const packagePath = path.join(__dirname, '..');
    const moveToml = fs.readFileSync(path.join(packagePath, 'Move.toml'), 'utf8');
    
    // Build the package first
    console.log('🔨 Building Move package...');
    const { execSync } = require('child_process');
    
    try {
      execSync('aptos move compile', { 
        cwd: packagePath,
        stdio: 'inherit'
      });
      console.log('✅ Package compiled successfully\n');
    } catch (error) {
      console.error('❌ Compilation failed:', error);
      return;
    }

    // Deploy the package
    console.log('🚀 Publishing package...');
    
    try {
      const result = execSync(`aptos move publish --private-key ${deployerAccount.privateKey} --assume-yes`, {
        cwd: packagePath,
        encoding: 'utf8'
      });
      
      console.log('✅ Package published successfully!');
      console.log(result);
      
      // Extract contract address (same as deployer address for Move)
      const contractAddress = deployerAccount.accountAddress.toString();
      
      console.log('\n🎉 Deployment Complete!');
      console.log('=======================');
      console.log(`📍 Contract Address: ${contractAddress}`);
      console.log(`🌐 Network: ${NETWORK}`);
      console.log(`🔍 Explorer: https://explorer.aptoslabs.com/account/${contractAddress}?network=${NETWORK}`);
      
      // Save deployment info
      const deploymentInfo = {
        network: NETWORK,
        contractAddress,
        deployerAddress: deployerAccount.accountAddress.toString(),
        deployedAt: new Date().toISOString(),
        transactionHash: 'See console output above',
      };
      
      fs.writeFileSync(
        path.join(__dirname, '..', 'deployment.json'),
        JSON.stringify(deploymentInfo, null, 2)
      );
      
      console.log('\n📄 Deployment info saved to deployment.json');
      
      // Update frontend contract address
      const frontendVaultPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'services', 'vault.ts');
      if (fs.existsSync(frontendVaultPath)) {
        let vaultContent = fs.readFileSync(frontendVaultPath, 'utf8');
        vaultContent = vaultContent.replace(
          /const VAULT_CONTRACT_ADDRESS = '[^']*'/,
          `const VAULT_CONTRACT_ADDRESS = '${contractAddress}'`
        );
        fs.writeFileSync(frontendVaultPath, vaultContent);
        console.log('✅ Frontend contract address updated');
      }
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Initialize the vault by calling the initialize function');
      console.log('2. Test deposits and withdrawals through the frontend');
      console.log('3. Configure AI agents to use this contract address');
      
    } catch (error) {
      console.error('❌ Publication failed:', error);
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

// Run deployment
deployContract().catch(console.error);
