
import * as Slider from '@radix-ui/react-slider';

export const weightSlider = (
    <Slider.Root
      className="SliderRoot"
      defaultValue={[45]}
      onValueChange={(value) => this.handleWeightChange(value)}
      min={-85}
      max={85}
      step={1}
      style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
      <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="Weight" />
    </Slider.Root>
  );

export const angleSlider = (
    <Slider.Root
      className="SliderRoot"
      defaultValue={[0]}
      onValueChange={(value) => this.handleAngleChange(value)}
      min={-180}
      max={180}
      step={1}
      style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
      <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="Weight" />
    </Slider.Root>
  );

export const biasSlider = (
    <Slider.Root
      className="SliderRoot"
      defaultValue={[0]}
      onValueChange={(value) => this.handleBiasChange(value)}
      min={-5}
      max={5}
      step={0.01}
      style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
      <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="Bias" />
    </Slider.Root>
);  

export const orderSlider = (
    <Slider.Root
        className="SliderRoot"
        defaultValue={[1]}
        onValueChange={(value) => this.handleOrderChange(value)}
        min={1}
        max={10}
        step={1}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
    <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="Order" />
    </Slider.Root>
);

export const nObjectsSlider = (
    <Slider.Root
        className="SliderRoot"
        defaultValue={[5]}
        onValueChange={(value) => this.handleMatrixChange(value, 1)}
        min={2}
        max={20}
        step={1}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
    <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="nObjects" />
    </Slider.Root>
);

export const nFeaturesSlider = (
    <Slider.Root
        className="SliderRoot"
        defaultValue={[3]}
        onValueChange={(value) => this.handleMatrixChange(value, 2)}
        min={1}
        max={10}
        step={1}
        style={{ width: Math.round(0.16 * (window.innerWidth * 0.97)), margin: 10 }}
    >
    <Slider.Track className="SliderTrack" style={{ height: 3 }}>
        <Slider.Range className="SliderRange" />
      </Slider.Track>
      <Slider.Thumb className="SliderThumb" aria-label="nFeatures" />
    </Slider.Root>
);