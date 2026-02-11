import { createListCollection } from '@chakra-ui/react';
import React from 'react';

import type { FormFields } from '../types';
import type { SmartContractVerificationConfig } from 'types/client/contract';

import { Link } from 'toolkit/chakra/link';
import { FormFieldSelect } from 'toolkit/components/forms/fields/FormFieldSelect';

import ContractVerificationFormRow from '../ContractVerificationFormRow';

// Solidity EVM version labels with default compiler version info
const EVM_VERSION_LABELS: Record<string, string> = {
  homestead: 'homestead (oldest version)',
  tangerineWhistle: 'tangerineWhistle',
  spuriousDragon: 'spuriousDragon',
  byzantium: 'byzantium (default for <= v0.5.4)',
  constantinople: 'constantinople',
  petersburg: 'petersburg (default for >= v0.5.5)',
  istanbul: 'istanbul (default for >= v0.5.14)',
  berlin: 'berlin (default for >= v0.8.5)',
  london: 'london (default for >= v0.8.7)',
  paris: 'paris (default for >= v0.8.18)',
  shanghai: 'shanghai (default for >= v0.8.20)',
  cancun: 'cancun (default for >= v0.8.24)',
  prague: 'prague (default for >= v0.8.30)',
};

interface Props {
  isVyper?: boolean;
  config: SmartContractVerificationConfig;
}

const ContractVerificationFieldEvmVersion = ({ isVyper, config }: Props) => {
  const collection = React.useMemo(() => {
    const items = (isVyper ? config?.vyper_evm_versions : config?.solidity_evm_versions)?.map((option) => {
      // Only apply labels for Solidity, keep Vyper labels unchanged
      const label = !isVyper && EVM_VERSION_LABELS[option] ? EVM_VERSION_LABELS[option] : option;
      return { label, value: option };
    }) || [];

    return createListCollection({ items });
  }, [ config?.solidity_evm_versions, config?.vyper_evm_versions, isVyper ]);

  return (
    <ContractVerificationFormRow>
      <FormFieldSelect<FormFields, 'evm_version'>
        name="evm_version"
        placeholder="EVM Version"
        collection={ collection }
        required
      />
      <>
        <span>The EVM version the contract is written for. If the bytecode does not match the version, we try to verify using the latest EVM version. </span>
        <Link
          href={ isVyper ?
            'https://docs.vyperlang.org/en/stable/compiling-a-contract.html#target-options' :
            'https://docs.soliditylang.org/en/latest/using-the-compiler.html#target-options'
          }
          external
          noIcon
        >
          EVM version details
        </Link>
      </>
    </ContractVerificationFormRow>
  );
};

export default React.memo(ContractVerificationFieldEvmVersion);
