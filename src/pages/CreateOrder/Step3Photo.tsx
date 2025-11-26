import { Link, useNavigate } from 'react-router-dom';
import AngleLeft from '@assets/angle-left.svg?react';
import Button from '../../components/Button';
import { QRCodeSVG } from 'qrcode.react';
import InfoIcon from '@assets/info.svg?react';
import { useEffect, useState, useMemo } from 'react';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import TrashIcon from '@assets/trash.svg?react';
import useSWR from 'swr';
// import 'react-medium-image-zoom/dist/styles.css';
import TestImage from '@assets/Walter_White2.webp';
import ImageZoom from '../../components/ImageZoom';

export default function Step3Photo() {
  const navigate = useNavigate();
  const { data, setSelectedService, addToPhotoBlockList } = useCreateOrderStore();
  const selected = useMemo(() => data.selectedService || {}, [data.selectedService]);
  const token = 'tbd';
  const initialPhotos = useMemo(() => selected.photos || [], [selected.photos]);
  const [photos, setPhotos] = useState<string[]>([]);
  const blockList = selected?.photoBlockList || [];
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  // const apiLink = import.meta.env.VITE_API_URL;
  // const photoLink = import.meta.env.VITE_PHOTO_URL;
  const testMode = false; // Set to true for testing purposes
  // useEffect(() => {
  //   const generateToken = async () => {
  //     try {
  //       const response = await fetch(`${apiLink}/generate-token`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });
  //       if (!response.ok) {
  //         throw new Error('Failed to generate token');
  //       }
  //       await response.json().then((data) => {
  //         console.log('Full link:', `${photoLink}/upload?id=${data.token}`);
  //         setSelectedService({ ...selected, photoToken: data.token });
  //       });
  //     } catch (error) {
  //       console.error('Error generating token:', error);
  //     }
  //   };

  //   if (!token) generateToken();
  // }, [token, apiLink, photoLink, selected, setSelectedService]);

  // start listening to /check/<token> endpoint for continuous updates
  // const { data: photoData, error } = useSWR(
  //   token ? `${apiLink}/check/${token}` : null,
  //   async (url) => {
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       return;
  //     }

  //     return response.json();
  //   },
  //   {
  //     refreshInterval: 1000,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: true,
  //     shouldRetryOnError: true,
  //     // continue same interval even on error
  //     errorRetryInterval: 1000,
  //     errorRetryCount: 100, // if error other than 404, stop retrying
  //     onError: () => {
  //       return;
  //     },
  //   },
  // );

  // useEffect(() => {
  //   if (photoData?.files && Array.isArray(photoData.files)) {
  //     setPhotos(photoData.files);
  //   }
  // }, [photoData]);

  // useEffect(() => {
  //   if (error) {
  //     console.error('Error checking token:', error);
  //   }
  // }, [error]);

  const finalList = photos.filter((photo) => !blockList.includes(photo));
  const handleReturn = () => {
    // When returning without saving, add all current photos that are not in initialPhotos to the blocklist
    const unsavedPhotos = photos.filter((photo) => !initialPhotos.includes(photo));
    if (unsavedPhotos.length > 0) {
      addToPhotoBlockList(unsavedPhotos);
    }
    navigate('/create-order/3/service');
  };
  const handleSave = () => {
    setSelectedService({ ...selected, photos: finalList });
    navigate('/create-order/3/service');
  };

  return (
    <div className="flex flex-col w-full flex-1 h-full overflow-y-auto py-4 gap-2">
      <div className="bg-white rounded-2xl flex items-center justify-between p-4 px-6">
        <div className="flex items-center gap-2">
          <Link
            to="/create-order/3/service"
            className="text-black hover:text-blue-hover active:text-blue-active transition-[.2s] cursor-pointer flex items-center gap-2"
          >
            <AngleLeft className="w-6 h-6 transform" />
          </Link>
          <h1>Service Parameters</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button label="Cancel" onClick={handleReturn} variant="ghost" />
          <Button label="Save" onClick={handleSave} variant="primary" />
        </div>
      </div>
      <div className="flex gap-2 flex-1">
        <div className="flex-1 bg-white rounded-2xl flex flex-col relative justify-end items-center p-6">
          {!selectedPhoto && !testMode && (
            <div className="flex flex-col gap-4 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 items-center">
              <h1 className="leading-[34px]">Scan QR to upload photo</h1>
              {token ? (
                <QRCodeSVG
                  value={`TBD`}
                  size={280}
                  className="w-[280px] h-[280px]"
                  level="H"
                  minVersion={9}
                />
              ) : (
                <div className="w-[280px] h-[280px] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">QR code is generating</span>
                </div>
              )}
            </div>
          )}
          {!selectedPhoto && !testMode && (
            <div className="py-2 px-4 flex items-center gap-2 bg-gray-accent rounded-lg w-fit">
              <InfoIcon className="w-4 h-4 text-blue" />
              <span className="text-md text-black">This section is currently unavailable.</span>
            </div>
          )}{' '}
          {(testMode || selectedPhoto) && (
            <div className="absolute inset-0 flex items-center justify-center px-6 py-4 overflow-hidden">
              {/* <img
                src={apiLink + selectedPhoto}
                alt="Selected"
                className="w-full h-full object-contain rounded-lg"
              /> */}
              {/* <img
                src={TestImage}
                alt="Selected"
                className="w-full h-full object-contain rounded-lg"
              /> */}
              {/* <ImageZoom imageSrc={testMode ? TestImage : apiLink + selectedPhoto} /> */}
            </div>
          )}
        </div>
        <div className=" bg-white rounded-2xl flex flex-col gap-6 w-[380px] shrink-0 py-4 px-6 relative">
          <span className="text-md font-semibold">Added Photos</span>
          {finalList.length === 0 ? (
            <span className="text-md">No photos yet</span>
          ) : (
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto scrollbar-small">
              {finalList.map((photo, index) => {
                const photoName = photo.split('/').pop() || '';
                return (
                  <div
                    className="flex gap-2 items-center justify-between w-full overflow-hidden"
                    key={index}
                  >
                    <div
                      className={`flex gap-2 items-center p-4 overflow-hidden rounded-lg border border-border flex-1 hover:border-blue cursor-pointer ${
                        selectedPhoto === photo ? '!border-blue' : ''
                      }`}
                      onClick={() => {
                        setSelectedPhoto(photo);
                        // setOrderValue('selectedPhoto', photo);
                        console.log('Selected photo:', photo);
                      }}
                    >
                      {/* <img
                        src={apiLink + photo}
                        alt={photoName}
                        className="w-[32px] h-[22px] object-cover rounded-lg"
                      /> */}
                      <span className="text-base w-full flex-1 overflow-hidden truncate">
                        {photoName}
                      </span>
                    </div>{' '}
                    <button
                      className="w-4 h-4 text-black hover:text-red transition-[.2s] cursor-pointer shrink-0"
                      onClick={() => {
                        console.log('Delete photo:', photo);
                        addToPhotoBlockList([photo]);
                        if (selectedPhoto === photo) {
                          setSelectedPhoto(null);
                        }
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedPhoto && (
            <div className="absolute bottom-4 right-6 h-[120px] w-[120px] bg-white">
              <QRCodeSVG
                value={`TBD`}
                size={120}
                className="w-full h-full"
                level="H"
                minVersion={9}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
