import { useEffect, useState } from 'react';

import { Delete, ErrorOutline, FileUpload, Lock } from '@mui/icons-material';
import { useLocation } from 'react-router';
import { useProjects } from '../data-providers/ProjectDataProvider';
import { useSearch } from '../data-providers/SearchProvider';
import { type Project } from '../models/ProjectsResponse';

import Footer from '../components/Footer';
import Header from '../components/Header';
import ProjectList from '../components/ProjectList';
import ProjectRepository from '../repositories/ProjectRepository';
import LoadingPage from './LoadingPage';

import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import SearchBar from '../components/SearchBar';
import styles from './../style/pages/Home.module.css';


export default function Home(): JSX.Element {
  const { loadingFailed } = useProjects()
  const { filteredProjects: projects, query, setQuery } = useSearch()
  const [showAll, setShowAll] = useState(false);
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])

  const location = useLocation()

  document.title = 'Home | docat'

  // insert # into the url if it's missing
  useEffect(() => {
    const nonHostPart = window.location.href.replace(window.location.origin, '')

    if (nonHostPart.startsWith('#') || nonHostPart.startsWith('/#')) {
      return
    }

    window.location.replace(`/#${nonHostPart}`)
  }, [location, setQuery, projects])

  const updateFavorites = (): void => {
    if (projects == null) return

    setFavoriteProjects(
      projects.filter((project) => ProjectRepository.isFavorite(project.name))
    )
  }

  const onShowFavourites = (all: boolean): void => {
    setShowAll(all);
  }

  useEffect(() => {
    updateFavorites()
  }, [projects])

  if (loadingFailed) {
    return (
      <div className={styles.home}>
        <Header />
        <div className={styles['loading-error']}>
          <ErrorOutline color="error" />
          <div>Failed to load projects</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (projects == null) {
    return <LoadingPage />
  }

  return (
    <div className={styles.home}>
      <Header />

      <div className={styles['project-overview']}>
        <Box sx={{
          display: 'flex'
        }}>

          <SearchBar showFavourites={!showAll} onShowFavourites={onShowFavourites} />

          <Tooltip title="Upload Documentation" placement="right" arrow>
            <IconButton
              sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '26px'}}
              href="/upload"
            >
              <FileUpload></FileUpload>
            </IconButton>
          </Tooltip>

          <Tooltip title="Claim a Project" placement="right" arrow>
            <IconButton
              sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '26px'}}
              href="/upload"
            >
              <Lock></Lock>
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete a project version" placement="right" arrow>
            <IconButton
              sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '26px'}}
              href="/delete"
            >
              <Delete></Delete>
            </IconButton>
          </Tooltip>
        </Box>

        { projects.length === 0 ?
          <>{ query !== "" ?
            <Box sx={{marginLeft: '24px', color: '#6e6e6e'}}>
              Couldn't find any docs
            </Box> :
            <Box sx={{marginLeft: '24px'}}>
              Looks like you don't have any docs yet.
              <Button href="/help" onClick={() => onShowFavourites(true)}>
                Get started now!
              </Button>
            </Box>
          }</> :
          <>
          { (query || showAll) ?
            <ProjectList
              projects={projects}
              onFavoriteChanged={() => {
                updateFavorites()
              }}
            />
            :
            <>
              <Typography sx={{ marginLeft: '24px', marginBottom: 1.5 }} fontWeight={200} fontSize={20}>FAVOURITES</Typography>
              { (favoriteProjects.length === 0) ?
                <Box sx={{marginLeft: '24px'}}>
                  No docs favourited at the moment, search for docs or
                  <Button onClick={() => onShowFavourites(true)}>
                    Show all docs.
                  </Button>

                </Box> :
                <ProjectList
                  projects={favoriteProjects}
                  onFavoriteChanged={() => {
                    updateFavorites()
                  }}
                />
              }
            </>
          }
          </>
        }

      </div>
      <Footer />
    </div>
  )
}
