import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useCreateOrderStore } from '../../stores/createOrderStore';
import PlusIcon from '@assets/plus.svg?react';
import { useState } from 'react';
import Popup from '../../components/Popup';
import Textarea from '../../components/Input/Textarea';
import EditIcon from '@assets/edit.svg?react';
import TrashIcon from '@assets/trash.svg?react';
import { useConfigStore } from '../../stores/configStore';

export default function Step6() {
  const navigate = useNavigate();
  const handleNext = () => {
    // navigate('/orders'); // replace with step 7 when design is ready
    navigate('/create-order/7');
  };
  const { config } = useConfigStore();
  const { data, addComment } = useCreateOrderStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleCreateComment = () => {
    const trimmedComment = comment.trim();
    const dateAndTime = new Date();
    const userName = config?.user?.name || 'John Doe'; // replace with actual user name from auth context or store
    if (trimmedComment) {
      addComment({
        id: Date.now().toString(),
        text: trimmedComment,
        date: dateAndTime,
        userName,
      });
      handleClosePopup();
    } else {
      setCommentError('Comment cannot be empty');
    }
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setCommentError(null);
    setComment('');
  };
  return (
    <>
      <Popup width={576} open={isPopupOpen} onClose={handleClosePopup}>
        <div className="flex flex-col gap-4">
          <Textarea
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={commentError}
            placeholder="Add a comment..."
            wrapperClassName="w-full"
          />
          <div className="w-full flex justify-center gap-4">
            <Button label="Cancel" onClick={handleClosePopup} variant="ghost" />
            <Button label="Save" onClick={handleCreateComment} variant="primary" />
          </div>
        </div>
      </Popup>
      <div className="flex flex-col w-full h-full relative gap-2">
        <div className="bg-white rounded-2xl flex gap-6 items-center justify-between p-4 px-6">
          <h1>Comments</h1>
          <Button
            label="Proceed to Completion"
            onClick={handleNext}
            variant="tertiary"
            size="medium"
            className="flex-shrink-0"
            // disabled={!selectedClientId}
          />
        </div>
        <div className="bg-white  rounded-2xl flex w-full py-4 px-6 relative gap-4">
          <Button
            label="Add Comment"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => {
              setIsPopupOpen(true);
            }}
            variant="ghost"
          />
        </div>
        {data.comments.length > 0 && (
          <div className="bg-white rounded-2xl flex flex-col w-full py-4 px-6 relative">
            <div className="flex items-center font-semibold text-base border-b border-lines h-[50px] ">
              <span className="px-4 py-[12px] flex-1 max-w-[358px]">Comment</span>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-[12px] w-[120px]">Date</div>
                <div className="px-4 py-[12px] w-[80px]">Time</div>
                <div className="px-4 py-[12px] w-[180px]">User</div>
              </div>
              <span className="px-4 py-[12px] w-[60px] text-center"></span>
            </div>
            {data.comments.map((c) => {
              const dateObj = new Date(c.date);
              const dateStr = dateObj.toLocaleDateString('en-US');
              const timeStr = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={c.id}
                  className="flex border-b border-lines last:border-b-0 gap-4 py min-h-[50px]"
                >
                  <span className="px-4 py-[12px] flex-1 max-w-[358px] break-words whitespace-pre-line">
                    {c.text}
                  </span>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-[12px] w-[120px]">{dateStr}</div>
                    <div className="px-4 py-[12px] w-[80px]">{timeStr}</div>
                    <div className="px-4 py-[12px] w-[180px] truncate">{c.userName}</div>
                  </div>
                  <div className="px-4 py-[12px] w-[60px] flex gap-2 justify-center h-[50px]">
                    <button className="hover:text-blue transition-colors" title="Edit">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button className="hover:text-blue transition-colors" title="Delete">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
