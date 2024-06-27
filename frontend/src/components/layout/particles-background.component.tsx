import Particles from 'react-tsparticles';
import styles from './particles-background.component.module.scss';

const ParticlesBackground: React.FC = () => {
	const config = {
		particles: {
			number: {
				value: 87,
				density: {
					enable: true,
					value_area: 747
				}
			},
			color: {
				value: "#ffffff"
			},
			shape: {
				type: "circle",
				stroke: {
					width: 0,
					color: "#000000"
				},
				polygon: {
					nb_sides: 5
				},
				image: {
					src: "img/github.svg",
					width: 100,
					height: 100
				}
			},
			opacity: {
				value: 1,
				random: true,
				anim: {
					enable: true,
					speed: 1,
					opacity_min: 0,
					sync: false
				}
			},
			size: {
				value: 3,
				random: true,
				anim: {
					enable: false,
					speed: 4,
					size_min: 0.3,
					sync: false
				}
			},
			line_linked: {
				enable: false,
				distance: 150,
				color: "#ffffff",
				opacity: 0.4,
				width: 1
			},
			move: {
				enable: true,
				speed: 1,
				direction: "none",
				random: true,
				straight: false,
				out_mode: "out",
				bounce: false,
				attract: {
					enable: false,
					rotateX: 600,
					rotateY: 600
				}
			}
		},
		interactivity: {
			detect_on: "canvas",
			events: {
				onhover: {
					enable: true,
					mode: "bubble"
				},
				onclick: {
					enable: false,
					mode: "repulse"
				},
				resize: true
			},
			modes: {
				grab: {
					distance: 59.93622785356379,
					line_linked: {
						opacity: 1
					}
				},
				bubble: {
					distance: 119.87245570712759,
					size: 0,
					duration: 2,
					opacity: 0.00799149704714184,
					speed: 3
				},
				repulse: {
					distance: 400,
					duration: 0.4
				},
				push: {
					particles_nb: 4
				},
				remove: {
					particles_nb: 2
				}
			}
		},
		retina_detect: true
	};

	return (
		<div id={styles.particlesContainer}>
			<Particles
				id="tsparticles"
				options={config as any}
			/>
		</div>
	);
};

export default ParticlesBackground;