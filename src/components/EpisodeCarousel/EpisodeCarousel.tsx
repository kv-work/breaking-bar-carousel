import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { EpisodeAction } from '../../redux/episodeReducer';
import { EpisodeActionTypes } from '../../redux/action.types';
import { State } from '../../redux/reducer';
import BreakingBadApiService from '../../services/BreakingBadApiService';
import { Episode } from '../../services/BreakingBadApiService.types';

import EpisodeCarouselProps from './EpisodeCarousel.types';
import EpisodeCard from '../EpisodeCard/EpisodeCard';

import styles from './EpisodeCarousel.module.scss';

const EpisodeCarousel: React.FC<EpisodeCarouselProps> = ({ numberOfCards = 3, renderCards }) => {
  const episodeData = useSelector((state: State) => state.episodes);
  const { data, status } = episodeData;
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useMediaQuery({
    query: '(max-width: 1100px)'
  })

  useEffect(() => {
    BreakingBadApiService.getEpisodes()
    .then((data: Episode[]) => {
      const action: EpisodeAction = {
        type: EpisodeActionTypes.EPISODE_LOADING_SUCCESS,
        payload: data,
      }

      dispatch(action);
    })
    .catch(err => {
      console.log(err)
      dispatch({ type: EpisodeActionTypes.EPISODE_LOADING_ERROR })
    });
  }, []);

  const selectActualCards = (cards: Episode[]): Episode[] => {
    if (isMobile) {
      return renderCards ? cards?.slice(0, renderCards) : cards;
    }

    let firstActualItem = numberOfCards * (currentPage - 1);
    let lastActualItem = firstActualItem + numberOfCards;

    const maxNumberOfCards = renderCards ? renderCards : cards.length;
    if (lastActualItem >= maxNumberOfCards) {
      lastActualItem = maxNumberOfCards;
      firstActualItem = lastActualItem - numberOfCards;
    }
    const actualCards = cards?.slice(firstActualItem, lastActualItem);
    return actualCards;
  };

  const actualCards = selectActualCards(data);

  const handlePrevClick = () => {
    setCurrentPage((prev) => {
      if (currentPage > 1) return prev - 1;
      return prev;
    });
  }

  const handleNextClick = () => {
    setCurrentPage((prev) => {
      const maxPageNumber = Math.floor(data.length / numberOfCards + 1);
      if (currentPage < maxPageNumber) return prev + 1;
      return prev;
    });
  }

  const carouselStyles = {
    gridTemplateColumns: `repeat(${numberOfCards}, 1fr)`,
  }

  const renderCarousel = (status: string, data: Episode[]) => {
    switch (status) {
      case 'success':
        return (
          <>
            <button className={styles.btnPrev} onClick={handlePrevClick} />
            <ul
              className={styles.carouselCards}
              style={isMobile ? {} : carouselStyles}
            >
              {data.map(character => <EpisodeCard key={character.air_date} data={character} />)}
            </ul>
            <button className={styles.btnNext} onClick={handleNextClick} />
          </>
        );
      case 'error':
        return  <div className="errorText">Episodes not found!</div>;
      default: return <div>Loading data...</div>
    }
  }

  return (
    <div className={styles.charactersCarousel}>
      <header className={styles.header}>
        <h2>Episodes of The Breaking Bad</h2>
        <div>Total {data.length} episodes.</div>
      </header>
      <div className={styles.carousel}>
        { renderCarousel(status, actualCards) }
      </div>
    </div>
  )
};

export default EpisodeCarousel;
