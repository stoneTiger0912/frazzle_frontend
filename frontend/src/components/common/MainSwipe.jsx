import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./MainSwipe.css";
import MainPage_pet from "../../assets/img/pet02.png";
import MainPage_family from "../../assets/img/family02.png";
import MainPage_lover from "../../assets/img/lover02.png";
import MainPage_friend from "../../assets/img/friend02.png";
const MainSwipe = () => {
  const images = [
    {
      src: MainPage_pet,
      caption: "with Pet",
    },
    {
      src: MainPage_family,
      caption: "with Family",
    },
    {
      src: MainPage_lover,
      caption: "lovers",
    },
    {
      src: MainPage_friend,
      caption: "with Friends",
    },
  ];

  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={2}
      centeredSlides={true}
      loop={true}
      effect="creative"
      creativeEffect={{
        prev: {
          shadow: true,
          translate: ["-120%", 0, -500],
        },
        next: {
          shadow: true,
          translate: ["120%", 0, -500],
        },
      }}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="home-photo-frame">
            <div className="home-photo">
              <img src={image.src} alt={`slide ${index + 1}`} />
              <div className="photo-name">{image.caption}</div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MainSwipe;
