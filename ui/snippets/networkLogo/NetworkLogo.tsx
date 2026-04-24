import { chakra } from '@chakra-ui/react';
import React from 'react';

import { route } from 'nextjs-routes';

import { useColorModeValue } from 'toolkit/chakra/color-mode';
import { Image } from 'toolkit/chakra/image';

type Props = {
  className?: string;
};

const NetworkLogo = ({ className }: Props) => {
  const logoSrc = useColorModeValue(
    '/assets/logo/somnia-logomark-dark.svg',
    '/assets/logo/somnia-logomark-light.svg',
  );
  const textColor = useColorModeValue('#070707', '#F5F5F5');

  return (
    <chakra.a
      className={ className }
      href={ route({ pathname: '/' }) }
      aria-label="Link to main page"
      display="flex"
      alignItems="center"
      gap="2"
    >
      <Image
        h="24px"
        w="auto"
        skeletonWidth="24px"
        src={ logoSrc }
        alt="Somnia logomark"
        objectFit="contain"
      />
      <chakra.span
        fontFamily="'Source Code Pro', monospace"
        fontSize="20px"
        fontWeight="500"
        color={ textColor }
        lineHeight="1"
        userSelect="none"
      >
        somnia
      </chakra.span>
    </chakra.a>
  );
};

export default React.memo(chakra(NetworkLogo));
