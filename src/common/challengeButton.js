import { styled } from '@stitches/react';
import { Button } from '@radix-ui/themes';

const ChallengeButton = styled(Button, {
    width: 136,   
    height: 84,
    fontSize: 'var(--font-size-2)',
    fontWeight: '500',
    boxShadow: '0 1px 3px var(--slate-a11)'
  });

export default ChallengeButton;