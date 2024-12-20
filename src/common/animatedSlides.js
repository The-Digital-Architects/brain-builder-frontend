import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import Slider from 'react-animated-slider';
import '../css/horizontalSlides.css';
import { Heading } from '@radix-ui/themes';

function MySlider(slideContent) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <Slider
      onSlideChange={handleSlideChange}
      previousButton={<ChevronLeftIcon style={{ color: currentSlide === slideContent.length - 1 ? 'var(--slate-9)' : 'var(--cyan-9)', width:64, height:64, cursor: currentSlide === slideContent.length - 1 ? 'not-allowed' : 'pointer' }}/>}
      nextButton={<ChevronRightIcon style={{ color: currentSlide === 0 ? 'var(--cyan-9)' : 'var(--slate-9)', width:64, height:64, cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}/>}
    >
      {slideContent.map((item, index) => (
        <div key={index} className="slide-container">
            <div className="slide-content">
            <Heading as='h2' size='5' style={{ color: 'var(--slate-12)', marginBottom:7, textAlign:"center" }}>&gt;_{item.title} </Heading>
            <p>{item.description}</p>
        </div>
        </div>
        ))}
    </Slider>
  );
}

export default MySlider;